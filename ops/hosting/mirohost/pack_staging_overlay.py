#!/usr/bin/env python3
"""Package the isolated overlay with Mirohost-readable ZIP permissions."""

import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[3]


def pack(overlay: Path, output: Path):
    overlay = overlay.resolve()
    output = output.resolve()
    if overlay.is_relative_to(ROOT) or output.is_relative_to(ROOT) or output.is_relative_to(overlay):
        raise ValueError('staging bytes must remain outside Git')
    marker = (overlay / '.dentix-version').read_text().strip()
    if not re.fullmatch('[0-9a-f]{40}', marker):
        raise ValueError('invalid source marker')
    if not (overlay / '.htaccess').is_file() or not (overlay / 'robots.txt').is_file():
        raise ValueError('staging controls missing')
    files = sorted(p for p in overlay.rglob('*') if p.is_file())
    dirs = sorted(p for p in overlay.rglob('*') if p.is_dir())
    if len(files) < 100 or any(p.is_symlink() for p in overlay.rglob('*')):
        raise ValueError('unsafe or incomplete staging overlay')
    with ZipFile(output, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for directory in dirs:
            info = ZipInfo(directory.relative_to(overlay).as_posix() + '/', (2026, 9, 29, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o40755 << 16
            archive.writestr(info, b'')
        for file in files:
            info = ZipInfo(file.relative_to(overlay).as_posix(), (2026, 9, 29, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, file.read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
    os.chmod(output, 0o600)
    return {'site_id': 'DENTIX', 'source_sha': marker, 'files': len(files),
            'directories': len(dirs), 'bytes': output.stat().st_size,
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('overlay', type=Path)
    p.add_argument('output', type=Path)
    a = p.parse_args()
    print(json.dumps(pack(a.overlay, a.output)))
