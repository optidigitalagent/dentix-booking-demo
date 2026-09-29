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


def exact(path):
    return '^' + re.escape(path.lstrip('/')) + '$'


def render(mode, source_sha, auth_user_file=None, sitemap_ready=False):
    if not re.fullmatch(r'[0-9a-f]{40}', source_sha):
        raise ValueError('source_sha must be a full Git SHA')
    contract = json.loads(CONTRACT.read_text())
    route_data = json.loads(ROUTES.read_text())
    rows = contract['rows']
    if contract['site_id'] != 'DENTIX' or route_data['site_id'] != 'DENTIX' or len(rows) != 64:
        raise ValueError('DENTIX migration identity/count mismatch')
    totals = {kind: sum(r['disposition'] == kind for r in rows) for kind in
              ('KEEP', 'REBUILD_SAME_URL', '301', '410', 'HOLD_FOR_CONFIRMATION')}
    if totals != {'KEEP': 3, 'REBUILD_SAME_URL': 4, '301': 7, '410': 1, 'HOLD_FOR_CONFIRMATION': 49}:
        raise ValueError('migration disposition drift')
    hold = [r for r in rows if r['disposition'] == 'HOLD_FOR_CONFIRMATION']
    if any(r['source_host'] != 'dentix.ua' or r['source_scheme'] != 'https' for r in hold):
        raise ValueError('unexpected HOLD host/scheme')
    hold_rules = '\n'.join(f'RewriteRule {exact(r["source_path"])} - [R=503,L]' for r in hold)
    route_paths = [r['path'] for r in route_data['routes']]
    if len(route_paths) != len(set(route_paths)) or len(route_paths) != 12:
        raise ValueError('route count/uniqueness drift')
    slash_rules = '\n'.join(
        f'RewriteRule {exact(path[:-1])} {"https://dentix.ua" if mode == "production" else ""}{path} [R=301,L,NE]'
        for path in route_paths if path not in ('/', '/price.html')
    )
    template = (HERE / (mode + '.htaccess.in')).read_text()
    result = template.replace('@SOURCE_SHA@', source_sha).replace('@HOLD_RULES@', hold_rules).replace('@SLASH_RULES@', slash_rules)
    if mode == 'production':
        sitemap = [r for r in rows if r['disposition'] == '301' and r['source_path'].startswith('/wp-sitemap')]
        if len(sitemap) != 5 or any(r['target_path'] != '/sitemap.xml' for r in sitemap):
            raise ValueError('sitemap migration drift')
        gate = '' if sitemap_ready else '\n'.join(f'RewriteRule {exact(r["source_path"])} - [R=503,L]' for r in sitemap)
        rules = '\n'.join(f'RewriteRule {exact(r["source_path"])} https://dentix.ua/sitemap.xml [R=301,L,NE]' for r in sitemap) if sitemap_ready else '\n'.join(f'# PENDING {exact(r["source_path"])} => https://dentix.ua/sitemap.xml 301' for r in sitemap)
        result = result.replace('@SITEMAP_GATE@', gate).replace('@SITEMAP_RULES@', rules)
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
