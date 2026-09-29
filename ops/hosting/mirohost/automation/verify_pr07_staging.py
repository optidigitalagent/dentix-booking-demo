#!/usr/bin/env python3
"""Read-only DENTIX PR-07 staging GET/HEAD and hash replay."""

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
from urllib.parse import urlencode, urljoin, urlparse

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('pr06_verify', HERE / 'verify_staging.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


def verify(overlay: Path):
    config_path = helper.PRIVATE_STAGE / 'review.json'
    if not config_path.is_file() or config_path.stat().st_mode & 0o077:
        raise ValueError('PRIVATE_CONFIG_UNSAFE')
    config = json.loads(config_path.read_text())
    base = config['url']
    parsed = urlparse(base)
    if (config['site_id'] != 'DENTIX' or parsed.scheme != 'https'
            or parsed.hostname != config['label'] + '.dentix.ua'
            or parsed.path != '/' or parsed.port):
        raise ValueError('STAGING_SCOPE_INVALID')
    password = helper.keychain_password(config['auth_keychain_service'],
        config['auth_keychain_account'])
    credential = config['auth_keychain_account'] + ':' + password
    contract = json.loads((ROOT / 'ops/release/migration-contract.json').read_text())
    index_policy = {r['path']: r for r in json.loads(
        (ROOT / 'ops/release/legacy-index-policy.json').read_text())['rows']}
    aliases = json.loads((ROOT / 'ops/release/query-aliases.json').read_text())
    routes = json.loads((ROOT / 'ops/release/routes.json').read_text())['routes']
    source_sha = (overlay / '.dentix-version').read_text().strip()
    if len(contract['rows']) != 99 or len(routes) != 12 or len(aliases['aliases']) != aliases['known_count']:
        raise ValueError('MANIFEST_DRIFT')
    if helper.request(base)[0] != 401:
        raise ValueError('UNAUTHENTICATED_NOT_401')
    checks = {'routes_get': 0, 'routes_head': 0, 'migration_get': 0,
              'migration_head': 0, 'aliases_get': 0, 'aliases_head': 0,
              'remote_file_hashes': 0, 'media_range': 0,
              'host_normalization_local_simulation_rows': 0}

    def ask(path, method='GET', headers=None, max_bytes=8_000_000):
        status, response_headers, body = helper.request(urljoin(base, path.lstrip('/')),
            method=method, credential=credential, headers=headers, max_bytes=max_bytes)
        if 'noindex' not in response_headers.get('X-Robots-Tag', '').lower():
            raise ValueError('NOINDEX_HEADER_MISSING')
        if response_headers.get('X-Dentix-Release') != source_sha:
            raise ValueError('RELEASE_HEADER_DRIFT')
        return status, response_headers, body

    for route in routes:
        for method in ('GET', 'HEAD'):
            status, _, body = ask(route['path'], method)
            if status != 200 or (method == 'GET' and b'noindex,nofollow,noarchive' not in body):
                raise ValueError('PATIENT_ROUTE_FAILED')
            checks['routes_' + method.lower()] += 1
    for row in contract['rows']:
        for method in ('GET', 'HEAD'):
            if row['source_host'] != 'dentix.ua' or row['source_scheme'] != 'https':
                # The production host/scheme edge is exercised by local Apache with Host/proto headers.
                status, _, _ = ask(row['source_path'], method)
                if status != 200:
                    raise ValueError('STAGING_HOST_ROW_FAILED')
                checks['host_normalization_local_simulation_rows'] += 1
            else:
                status, headers, body = ask(row['source_path'], method)
                if status != row['target_status']:
                    raise ValueError('MIGRATION_ROW_STATUS_FAILED')
                if row['source_path'] in index_policy and headers.get('X-Robots-Tag') != 'noindex, nofollow, noarchive':
                    raise ValueError('LEGACY_INDEX_POLICY_FAILED')
                if status == 301 and urlparse(headers.get('Location', '')).path != row['target_path']:
                    raise ValueError('MIGRATION_LOCATION_FAILED')
                if method == 'GET' and row['disposition'] == '200_STATIC_PRESERVE_HTML' and b'noindex,nofollow,noarchive' not in body:
                    raise ValueError('PRESERVED_HTML_META_FAILED')
                if row['disposition'] == '200_STATIC_PRESERVE_XML' and 'rss' not in headers.get('Content-Type', '').lower():
                    raise ValueError('PRESERVED_XML_TYPE_FAILED')
                if (row['disposition'] == '200_STATIC_PRESERVE_MEDIA' and
                        index_policy[row['source_path']]['content_type'].split(';')[0] not in headers.get('Content-Type', '')):
                    raise ValueError('PRESERVED_OBJECT_TYPE_FAILED')
            checks['migration_' + method.lower()] += 1
    for alias in aliases['aliases']:
        query = urlencode({alias['key']: alias['value']})
        for method in ('GET', 'HEAD'):
            status, headers, _ = ask(alias['source_path'] + '?' + query, method)
            if status != (301 if alias['target_path'] else 410):
                raise ValueError('QUERY_ALIAS_STATUS_FAILED')
            if alias['target_path'] and urlparse(headers.get('Location', '')).path != alias['target_path']:
                raise ValueError('QUERY_ALIAS_LOCATION_FAILED')
            checks['aliases_' + method.lower()] += 1
    for query in ('?p=99999', '?page_id=2', '?attachment_id=3', '?s=probe',
                  '?rest_route=%2Funknown', '?p=1&p=99999',
                  '?p=1&attachment_id=3', '?%70=1'):
        if ask('/' + query)[0] != 410:
            raise ValueError('UNKNOWN_QUERY_NOT_CLOSED')
    if ask('/sitemap_index.xml')[0] != 404 or ask('/missing-pr07-probe')[0] != 404:
        raise ValueError('CUSTOM_404_FAILED')
    if ask('/sayt-nahoditsya-na-tehnicheskom-obsluzh/')[0] != 410:
        raise ValueError('EXACT_410_FAILED')
    if ask('/robots.txt')[2] != b'User-agent: *\nDisallow: /\n':
        raise ValueError('STAGING_ROBOTS_FAILED')
    if ask('/.dentix-version')[2].strip().decode() != source_sha:
        raise ValueError('VERSION_MARKER_FAILED')
    status, headers, _ = ask('/?url=https://example.org/')
    if status != 200 or 'example.org' in headers.get('Location', ''):
        raise ValueError('OPEN_PROXY_FAILED')
    media = [row for row in contract['rows'] if row['disposition'] == '200_STATIC_PRESERVE_MEDIA']
    for row in media:
        status, headers, body = ask(row['source_path'], headers={'Range': 'bytes=0-31'})
        if status != 206 or len(body) != 32 or 'bytes 0-31/' not in headers.get('Content-Range', ''):
            raise ValueError('MEDIA_RANGE_FAILED')
        checks['media_range'] += 1
    for file in overlay.rglob('*'):
        if not file.is_file() or file.name == '.htaccess' or '.vite' in file.parts:
            continue
        relative = file.relative_to(overlay).as_posix()
        status, _, body = ask('/' + relative, max_bytes=file.stat().st_size + 1)
        if status != 200 or hashlib.sha256(body).digest() != hashlib.sha256(file.read_bytes()).digest():
            raise ValueError('REMOTE_FILE_HASH_MISMATCH')
        checks['remote_file_hashes'] += 1
    return {'site_id': 'DENTIX', 'status': 'PASS', 'source_sha': source_sha,
            'basic_auth': True, 'noindex': True, 'redirect_loop': False,
            'open_proxy': False, 'generic_homepage_fallbacks': 0, **checks}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--overlay', required=True, type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.overlay)))
    except Exception as error:
        print(json.dumps({'site_id': 'DENTIX', 'status': 'BLOCKED',
            'blocker': str(error) if isinstance(error, ValueError) else 'STAGING_QA_FAILED'}))
        raise SystemExit(2)
