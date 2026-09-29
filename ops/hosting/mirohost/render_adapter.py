#!/usr/bin/env python3
"""Render a DENTIX-only Apache adapter from the immutable migration contract."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
CONTRACT = ROOT / 'ops/release/migration-contract.json'
ROUTES = ROOT / 'ops/release/routes.json'
ALIASES = ROOT / 'ops/release/query-aliases.json'
INDEX_POLICY = ROOT / 'ops/release/legacy-index-policy.json'

FINAL_TYPES = ('200_REBUILD_SAME_URL', '200_STATIC_PRESERVE_HTML',
               '200_STATIC_PRESERVE_XML', '200_STATIC_PRESERVE_MEDIA',
               '301_EXACT_REPLACEMENT', '404_KEEP', '410_RETIRE')


def exact(path):
    return '^' + re.escape(path.lstrip('/')) + '$'


def render(mode, source_sha, auth_user_file=None, sitemap_ready=False):
    if not re.fullmatch(r'[0-9a-f]{40}', source_sha):
        raise ValueError('source_sha must be a full Git SHA')
    contract = json.loads(CONTRACT.read_text())
    route_data = json.loads(ROUTES.read_text())
    aliases = json.loads(ALIASES.read_text())
    rows = contract['rows']
    if (contract['site_id'] != 'DENTIX' or route_data['site_id'] != 'DENTIX'
            or aliases['site_id'] != 'DENTIX' or len(rows) != 99):
        raise ValueError('DENTIX migration identity/count mismatch')
    totals = {kind: sum(r['disposition'] == kind for r in rows) for kind in FINAL_TYPES if any(r['disposition'] == kind for r in rows)}
    if totals != contract['disposition_totals'] or any(r['disposition'] not in FINAL_TYPES for r in rows):
        raise ValueError('migration disposition drift')
    if len(aliases['aliases']) != aliases['known_count'] or aliases['known_count'] < 50:
        raise ValueError('query alias inventory incomplete')
    for row in aliases['aliases']:
        if row['key'] not in aliases['functional_keys'] or row['disposition'] not in ('301_EXACT_REPLACEMENT', '410_RETIRE'):
            raise ValueError('invalid query alias')
        if row['disposition'] == '301_EXACT_REPLACEMENT' and not row['target_path']:
            raise ValueError('missing alias target')
    target_host = 'https://dentix.ua' if mode == 'production' else ''
    query_rules = []
    for alias in sorted(aliases['aliases'], key=lambda x: (-len(x['source_path']), x['key'], x['value'])):
        value = re.escape(alias['value']).replace(r'/', r'(?:/|%2F)')
        # A second functional selector (or duplicate key) must never inherit a
        # known alias decision. The final rule below retires such queries.
        query_rules.append(f'RewriteCond %{{QUERY_STRING}} ^{re.escape(alias["key"])}={value}$ [NC]')
        action = (target_host + alias['target_path']) if alias['target_path'] else '-'
        flags = 'R=301,L,QSD,NE' if alias['target_path'] else 'G,L'
        query_rules.append(f'RewriteRule {exact(alias["source_path"])} {action} [{flags}]')
    path_rules = []
    for row in rows:
        path = row['source_path']
        if row['disposition'] == '410_RETIRE':
            path_rules.append(f'RewriteRule {exact(path)} - [G,L]')
        elif row['disposition'] == '404_KEEP':
            path_rules.append(f'RewriteRule {exact(path)} - [R=404,L]')
    policy = json.loads(INDEX_POLICY.read_text())
    if policy['site_id'] != 'DENTIX' or {r['path'] for r in policy['rows']} != {
            r['source_path'] for r in rows if r['disposition'].startswith('200_STATIC_')
            or (r['disposition'] == '410_RETIRE' and r['source_path'].startswith('/wp-content/uploads/'))}:
        raise ValueError('legacy index policy coverage drift')
    if any(r['indexability'] != 'NOINDEX' or r['x_robots_tag'] != 'noindex, nofollow, noarchive'
           or r['canonical'] != 'NONE' for r in policy['rows']):
        raise ValueError('unsafe legacy index policy')
    # Apache Header expr evaluates the original requested URI, including
    # directory index requests. Every legacy object receives an exact rule.
    index_headers = '\n'.join(
        line for r in policy['rows']
        for path in dict.fromkeys((r['path'], r.get('artifact_path', r['path'])))
        for line in (
            f'  Header always set X-Robots-Tag "noindex, nofollow, noarchive" "expr=%{{REQUEST_URI}} == \'{path}\'"',
            f'  Header always set Cache-Control "{r["cache_control"]}" "expr=%{{REQUEST_URI}} == \'{path}\'"'))
    sitemap = [r for r in rows if r['disposition'] == '301_EXACT_REPLACEMENT' and r['source_path'].startswith('/wp-sitemap')]
    if len(sitemap) != 5 or any(r['target_path'] != '/sitemap.xml' for r in sitemap):
        raise ValueError('sitemap migration drift')
    sitemap_gate = '' if sitemap_ready else '\n'.join(f'RewriteRule {exact(r["source_path"])} - [R=503,L]' for r in sitemap)
    sitemap_rules = '\n'.join(f'RewriteRule {exact(r["source_path"])} {target_host}/sitemap.xml [R=301,L,NE]' for r in sitemap) if sitemap_ready else '\n'.join(f'# PENDING {exact(r["source_path"])} => /sitemap.xml 301' for r in sitemap)
    route_paths = [r['path'] for r in route_data['routes']]
    if len(route_paths) != len(set(route_paths)) or len(route_paths) != 12:
        raise ValueError('route count/uniqueness drift')
    slash_rules = '\n'.join(
        f'RewriteRule {exact(path[:-1])} {"https://dentix.ua" if mode == "production" else ""}{path} [R=301,L,NE]'
        for path in route_paths if path not in ('/', '/price.html')
    )
    template = (HERE / (mode + '.htaccess.in')).read_text()
    result = (template.replace('@SOURCE_SHA@', source_sha)
        .replace('@QUERY_RULES@', '\n'.join(query_rules))
        .replace('@PATH_RULES@', '\n'.join(path_rules))
        .replace('@LEGACY_INDEX_HEADERS@', index_headers if mode == 'production' else '')
        .replace('@SITEMAP_GATE@', sitemap_gate)
        .replace('@SITEMAP_RULES@', sitemap_rules)
        .replace('@SLASH_RULES@', slash_rules))
    if mode == 'production':
        pass
    elif mode == 'staging':
        if not auth_user_file or not Path(auth_user_file).is_absolute() or '"' in auth_user_file or '\n' in auth_user_file:
            raise ValueError('absolute safe auth-user-file path required')
        result = result.replace('@AUTH_USER_FILE@', auth_user_file)
    else:
        raise ValueError('invalid adapter mode')
    if re.search(r'@[A-Z_]+@', result):
        raise ValueError('unrendered adapter token')
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument('mode', choices=('production', 'staging'))
    p.add_argument('--source-sha', required=True)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--auth-user-file')
    p.add_argument('--sitemap-ready', action='store_true')
    a = p.parse_args()
    if a.output.resolve().is_relative_to(ROOT):
        raise SystemExit('Render outside the repository; never write live WordPress')
    a.output.write_text(render(a.mode, a.source_sha, a.auth_user_file, a.sitemap_ready))


if __name__ == '__main__':
    main()
