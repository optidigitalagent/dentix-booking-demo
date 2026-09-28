#!/usr/bin/env python3
"""Create a local noindex overlay from a verified DENTIX release ZIP."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[3]


def prepare(archive: Path, target: Path):
    if target.exists() or target.is_symlink() or target.resolve().is_relative_to(ROOT):
        raise ValueError('staging target must be new and isolated')
    with ZipFile(archive) as z:
        manifest = json.loads(z.read('release-manifest.json'))
        if manifest['site_id'] != 'DENTIX' or manifest['booking_enabled'] is not False:
            raise ValueError('wrong or unsafe release candidate')
        if not re.fullmatch(r'[0-9a-f]{40}', manifest['source_sha']):
            raise ValueError('invalid source SHA')
        entries = {r['path']: r for r in manifest['files']}
        if not entries or len(entries) != len(manifest['files']):
            raise ValueError('invalid artifact manifest')
        for info in z.infolist():
            if info.filename.startswith('artifact/'):
                name = info.filename[len('artifact/'):]
                if name not in entries or name.startswith('/') or '..' in Path(name).parts or (info.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError('unexpected artifact path')
                data = z.read(info)
                if hashlib.sha256(data).hexdigest() != entries[name]['sha256']:
                    raise ValueError('artifact hash mismatch')
        if {n[len('artifact/'):] for n in z.namelist() if n.startswith('artifact/')} != set(entries):
            raise ValueError('artifact file set mismatch')
        target.mkdir(mode=0o700, parents=True)
        for name in entries:
            path = target / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(z.read('artifact/' + name))
        route_data = json.loads(z.read('route-manifest.json'))
        if route_data['site_id'] != 'DENTIX' or len(route_data['routes']) != 12:
            raise ValueError('route manifest mismatch')
        for route in route_data['routes']:
            path = target / route['artifact']
            html = path.read_text()
            html, count = re.subn(r'<meta name="robots" content="index,follow"\s*/?>',
                                  '<meta name="robots" content="noindex,nofollow,noarchive" />', html, count=1)
            if count != 1:
                raise ValueError('patient meta robots marker missing')
            path.write_text(html)
        (target / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
        (target / '.dentix-version').write_text(manifest['source_sha'] + '\n')
        return {'site_id': 'DENTIX', 'source_sha': manifest['source_sha'],
                'candidate_sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                'route_count': 12, 'overlay': 'NOINDEX_LOCAL_COPY'}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('archive', type=Path)
    p.add_argument('target', type=Path)
    a = p.parse_args()
    print(json.dumps(prepare(a.archive, a.target)))


if __name__ == '__main__':
    main()
