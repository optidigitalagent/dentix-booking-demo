#!/usr/bin/env python3
"""Rebuild the private DENTIX preservation archive from verified local sources.

The source archives and output must remain outside the repository. No source
bytes, credentials, or private paths are written to the committed manifest.
"""

import argparse
import hashlib
import os
import tarfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo
import json
import re

ROOT = Path(__file__).resolve().parents[2]


def preserved_html(data):
    if re.search(br'<(?:script|form)\b', data, re.I):
        raise ValueError('unsafe legacy HTML')
    data, count = re.subn(br'<meta name="robots" content="index,follow">',
                          b'<meta name="robots" content="noindex,nofollow,noarchive">', data)
    if count != 1:
        raise ValueError('legacy HTML robots marker drift')
    data, count = re.subn(br'<link rel="canonical" href="[^"]+">', b'', data)
    if count != 1:
        raise ValueError('legacy HTML canonical marker drift')
    return data


def minimal_feed(path):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<rss version="2.0"><channel><title>DENTIX legacy archive</title>'
            f'<link>https://dentix.ua{path}</link>'
            f'<description>Archived endpoint</description></channel></rss>\n').encode()


def build(baseline_zip, backup_tar, output):
    if any(p.resolve().is_relative_to(ROOT) for p in (baseline_zip, backup_tar, output)):
        raise ValueError('private archives must remain outside Git')
    manifest = json.loads((ROOT / 'ops/release/preservation-manifest.json').read_text())
    expected = {item['path'].lstrip('/'): item for item in manifest['files']}
    if manifest['site_id'] != 'DENTIX' or len(expected) != len(manifest['files']):
        raise ValueError('preservation manifest drift')
    data = {}
    with ZipFile(baseline_zip) as original, tarfile.open(backup_tar, 'r:gz') as backup:
        names = backup.getnames()
        for name, entry in expected.items():
            if name.startswith('/') or '..' in Path(name).parts or '\\' in name:
                raise ValueError('unsafe path')
            if name in original.namelist():
                value = original.read(name)
                if name.endswith('.html'):
                    value = preserved_html(value)
                elif name.endswith('.rss'):
                    value = minimal_feed('/' + name.removesuffix('index.rss'))
            else:
                matches = [member for member in names if member.endswith('/' + name)]
                if len(matches) != 1:
                    raise ValueError('backup member missing or ambiguous')
                value = backup.extractfile(matches[0]).read()
            if len(value) != entry['bytes'] or hashlib.sha256(value).hexdigest() != entry['sha256']:
                raise ValueError('preservation hash drift')
            data[name] = value
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, value in sorted(data.items()):
            info = ZipInfo(name, (2026, 9, 29, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, value, compress_type=ZIP_DEFLATED, compresslevel=9)
    os.chmod(output, 0o600)
    return {'site_id': 'DENTIX', 'files': len(data), 'bytes': output.stat().st_size,
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline', type=Path, required=True)
    parser.add_argument('--backup', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(build(args.baseline, args.backup, args.output)))
