#!/usr/bin/env python3
"""Assemble the reviewed DENTIX public deploy bytes outside Git."""

import argparse
import hashlib
import importlib.util
import io
import json
import os
import re
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[2]
OPS = ROOT / 'ops/release'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode()


def checked_member(name):
    path = Path(name)
    if name.startswith('/') or '..' in path.parts or '\\' in name:
        raise ValueError('unsafe package member')


def build(release_zip, preservation_zip, output):
    output = output.resolve()
    if output.is_relative_to(ROOT):
        raise ValueError('GO archive must stay outside Git')
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    if not re.fullmatch('[0-9a-f]{40}', head):
        raise ValueError('invalid Git head')
    if subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=no'], cwd=ROOT).strip():
        raise ValueError('commit reviewed source before GO packaging')
    contract = (OPS / 'migration-contract.json').read_bytes()
    aliases = (OPS / 'query-aliases.json').read_bytes()
    decisions = (OPS / 'hold-decisions.json').read_bytes()
    preservation_manifest = (OPS / 'preservation-manifest.json').read_bytes()
    rows = json.loads(contract)['rows']
    if len(rows) != 64 or any(row['disposition'] == 'HOLD_FOR_CONFIRMATION' for row in rows):
        raise ValueError('unresolved migration rows')
    if len(json.loads(aliases)['aliases']) != 58 or len(json.loads(decisions)['rows']) != 49:
        raise ValueError('inventory count drift')
    preserved = {entry['path'].lstrip('/'): entry for entry in json.loads(preservation_manifest)['files']}
    if len(preserved) != 49:
        raise ValueError('preservation count drift')

    payload = {}
    with ZipFile(release_zip) as archive:
        release = json.loads(archive.read('release-manifest.json'))
        if release['site_id'] != 'DENTIX' or release['source_sha'] != head or release['booking_enabled'] is not False:
            raise ValueError('release source or launch mode drift')
        files = {entry['path']: entry for entry in release['files']}
        if set(archive.namelist()) - {'release-manifest.json', 'route-manifest.json', 'SHA256SUMS.txt'} != {'artifact/' + p for p in files}:
            raise ValueError('release file inventory drift')
        for name, entry in files.items():
            checked_member(name)
            data = archive.read('artifact/' + name)
            if sha(data) != entry['sha256']:
                raise ValueError('release file hash drift')
            payload['site/' + name] = data
        routes = archive.read('route-manifest.json')
        if len(json.loads(routes)['routes']) != 12:
            raise ValueError('route count drift')
    with ZipFile(preservation_zip) as archive:
        if set(archive.namelist()) != set(preserved):
            raise ValueError('preservation member drift')
        for name, entry in preserved.items():
            checked_member(name)
            data = archive.read(name)
            if len(data) != entry['bytes'] or sha(data) != entry['sha256']:
                raise ValueError('preservation hash drift')
            destination = 'site/' + name
            if destination in payload:
                raise ValueError('release/preservation collision')
            payload[destination] = data

    spec = importlib.util.spec_from_file_location('adapter', ROOT / 'ops/hosting/mirohost/render_adapter.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    payload['deploy/production-sitemap-gated.htaccess'] = module.render('production', head).encode()
    payload['deploy/production-sitemap-ready.htaccess'] = module.render('production', head, sitemap_ready=True).encode()
    payload['contracts/migration-contract.json'] = contract
    payload['contracts/query-aliases.json'] = aliases
    payload['contracts/hold-decisions.json'] = decisions
    payload['contracts/preservation-manifest.json'] = preservation_manifest
    payload['contracts/route-manifest.json'] = routes
    payload['contracts/release-manifest.json'] = encoded(release)
    payload['contracts/rollback.json'] = encoded({
        'site_id': 'DENTIX', 'status': 'PLAN_ONLY_NOT_EXECUTED', 'source_sha': head,
        'trigger': 'Any failed production status, host normalization, Basic route, conversion or legacy-path check',
        'action': 'Restore verified private pre-cutover WordPress files/database and original root routing from external backup; verify exact legacy paths and critical content fingerprints',
        'backup_bytes_in_package': False, 'production_mutation_authorized': False})
    payload['contracts/conversion-launch-mode.json'] = encoded({
        'site_id': 'DENTIX', 'mode': 'PHONE_FIRST_FAIL_CLOSED', 'booking_enabled': False,
        'lead_endpoint': None, 'booking_endpoint': None, 'real_submission_tested': False})
    payload['contracts/credential-rotation-checklist.json'] = encoded({
        'site_id': 'DENTIX', 'status': 'P0_PENDING_SEPARATE_CUTOVER_AUTHORIZATION',
        'actions': ['Rotate WordPress, database, Mirohost and FTP/SSH credentials with the owner',
                    'Record rotation in a private vault without adding credentials to Git or evidence',
                    'Verify rollback access with the owner before production mutation']})
    payload['contracts/go-manifest.json'] = encoded({
        'schema_version': 1, 'site_id': 'DENTIX', 'source_sha': head,
        'status': 'CANDIDATE_NOT_DEPLOYED', 'migration_rows': 64, 'query_aliases': 58,
        'preserved_files': 49, 'sitemap_activation': 'GATED_UNTIL_NEW_SITEMAP_LIVE',
        'site_file_count': sum(name.startswith('site/') for name in payload),
        'files': [{'path': name, 'bytes': len(data), 'sha256': sha(data)}
                  for name, data in sorted(payload.items())]})
    payload['SHA256SUMS.txt'] = ''.join(f'{sha(data)}  {name}\n' for name, data in sorted(payload.items())).encode()
    buffer = io.BytesIO()
    with ZipFile(buffer, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        directories = sorted({parent.as_posix() + '/' for name in payload
                              for parent in Path(name).parents if parent != Path('.')})
        for directory in directories:
            info = ZipInfo(directory, (2026, 9, 29, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o40755 << 16
            archive.writestr(info, b'')
        for name, data in sorted(payload.items()):
            info = ZipInfo(name, (2026, 9, 29, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(buffer.getvalue())
    os.chmod(output, 0o600)
    return {'site_id': 'DENTIX', 'status': 'CANDIDATE_NOT_DEPLOYED',
            'source_sha': head, 'path': str(output), 'bytes': output.stat().st_size,
            'sha256': sha(output.read_bytes()), 'site_file_count': sum(n.startswith('site/') for n in payload)}


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--release', type=Path, required=True)
    p.add_argument('--preservation', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    print(json.dumps(build(a.release, a.preservation, a.output)))
