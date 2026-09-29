#!/usr/bin/env python3
"""Build an isolated PR-07 staging overlay from verified external packages."""

import argparse
import hashlib
import importlib.util
import json
import re
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


base_staging = load_module('base_staging', HERE / 'prepare_staging.py')
adapter = load_module('adapter', HERE / 'render_adapter.py')


def prepare(release_zip: Path, preservation_zip: Path, target: Path, auth_user_file: str):
    receipt = base_staging.prepare(release_zip, target)
    manifest = json.loads((ROOT / 'ops/release/preservation-manifest.json').read_text())
    expected = {entry['path'].lstrip('/'): entry for entry in manifest['files']}
    if len(expected) != 81 or manifest['site_id'] != 'DENTIX':
        raise ValueError('preservation contract drift')
    with ZipFile(preservation_zip) as archive:
        if set(archive.namelist()) != set(expected):
            raise ValueError('preservation file set drift')
        for name, entry in expected.items():
            if name.startswith('/') or '..' in Path(name).parts:
                raise ValueError('unsafe preservation path')
            data = archive.read(name)
            if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
                raise ValueError('preservation hash drift')
            if name.endswith('.html'):
                if (b'<meta name="robots" content="noindex,nofollow,noarchive">' not in data
                        or b'rel="canonical"' in data.lower() or b'<form' in data.lower()
                        or b'<script' in data.lower()):
                    raise ValueError('legacy HTML sanitization failed')
            elif name.endswith('.rss'):
                if b'<rss' not in data or b'<script' in data.lower() or b'<form' in data.lower():
                    raise ValueError('legacy XML sanitization failed')
            path = target / name
            if path.exists():
                raise ValueError('preservation artifact collision')
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    (target / '.htaccess').write_text(adapter.render('staging', receipt['source_sha'],
        auth_user_file, sitemap_ready=True))
    return {'site_id': 'DENTIX', 'status': 'PASS_LOCAL_OVERLAY',
        'source_sha': receipt['source_sha'], 'patient_routes': 12,
        'preserved_files': len(expected), 'noindex': True,
        'basic_auth_configured': True}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('release_zip', type=Path)
    parser.add_argument('preservation_zip', type=Path)
    parser.add_argument('target', type=Path)
    parser.add_argument('--auth-user-file', required=True)
    args = parser.parse_args()
    print(json.dumps(prepare(args.release_zip, args.preservation_zip, args.target,
        args.auth_user_file)))
