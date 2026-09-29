import gzip
import importlib.util
import json
import csv
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


inventory = load('legacy_inventory', ROOT / 'ops/release/legacy_inventory.py')
logs = load('aggregate_logs', ROOT / 'ops/release/aggregate_logs.py')
preservation = load('build_pr07_preservation', ROOT / 'ops/release/build_pr07_preservation.py')


class LegacyInventoryTest(unittest.TestCase):
    def test_multiline_mysql_values_and_escape_safety(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'fixture.sql.gz'
            with gzip.open(source, 'wt') as output:
                output.write("INSERT INTO `wp_posts` VALUES\n(1,'public\\' title',NULL),\n(2,'line\\nnext',3);\n")
                output.write("INSERT INTO `wp_users` VALUES (1,'private');\n")
            rows = list(inventory.selected_tables(source, {'wp_posts'}))
            self.assertEqual(rows, [('wp_posts', ['1', "public' title", None]),
                                    ('wp_posts', ['2', 'line\nnext', '3'])])

    def test_log_aggregation_never_emits_visitor_identifiers(self):
        raw = ('visitor-token - - [28/Sep/2026:12:00:00 +0000] '
               '"GET /feed/?p=1 HTTP/1.1" 200 23 "-" "Googlebot/2.1"\n')
        with tempfile.TemporaryDirectory() as temp:
            (Path(temp) / 'access_log').write_text(raw)
            result = logs.aggregate(temp, {'/feed/'}, datetime(2026, 9, 29, tzinfo=timezone.utc))
            record = result['windows']['28']['rows']['/feed/']
            self.assertEqual(record['requests'], 1)
            self.assertEqual(record['user_agent_classes'], {'GOOGLEBOT': 1})
            self.assertNotIn('visitor-token', json.dumps(result))
            self.assertNotIn('?p=1', json.dumps(result))

    def test_final_manifest_and_alias_targets(self):
        contract = json.loads((ROOT / 'ops/release/migration-contract.json').read_text())
        manifest = json.loads((ROOT / 'ops/release/preservation-manifest.json').read_text())
        aliases = json.loads((ROOT / 'ops/release/query-aliases.json').read_text())
        paths = {row['source_path'] for row in contract['rows'] if row['disposition'].startswith('200_STATIC_')}
        self.assertEqual(len(paths), 81)
        self.assertEqual(len(manifest['files']), 81)
        self.assertFalse(any(row['disposition'] == 'HOLD_FOR_CONFIRMATION' for row in contract['rows']))
        self.assertEqual(len(aliases['aliases']), aliases['known_count'])
        targets = {row['path'] for row in json.loads((ROOT / 'ops/release/routes.json').read_text())['routes']} | paths
        for alias in aliases['aliases']:
            if alias['target_path']:
                self.assertIn(alias['target_path'], targets)
            else:
                self.assertEqual(alias['disposition'], '410_RETIRE')

    def test_direct_paths_are_executable_and_consent_exclusions_are_exact(self):
        contract = json.loads((ROOT / 'ops/release/migration-contract.json').read_text())
        decisions = json.loads((ROOT / 'ops/release/direct-path-decisions.json').read_text())
        with (ROOT / '.seo/redirect-map.csv').open(newline='') as source:
            redirects = list(csv.DictReader(source))
        contract_by_path = {row['source_path']: row for row in contract['rows']}
        self.assertEqual(len(contract['rows']), 99)
        self.assertEqual(len(contract_by_path), 97)  # two host/scheme normalization variants
        self.assertEqual(len(redirects), 99)
        self.assertEqual(len({row['source_url'] for row in contract['rows']}), 99)
        self.assertEqual(decisions['original_attachment_paths'], 15)
        self.assertEqual(decisions['deduplicated_new_paths'], 35)
        self.assertEqual(len(decisions['rows']), 35)
        for decision in decisions['rows']:
            path = decision['path']
            self.assertEqual(contract_by_path[path]['disposition'], decision['disposition'])
            self.assertEqual(sum(row['normalized_path'] == path for row in redirects), 1)
            if decision['disposition'] == '410_RETIRE':
                self.assertIsNone(decision.get('backup_sha256'))
                self.assertIsNone(decision.get('backup_bytes'))
                self.assertEqual(contract_by_path[path]['target_status'], 410)
        self.assertEqual(sum(row['disposition'] == '410_RETIRE' for row in decisions['rows']), 3)

    def test_index_policy_covers_every_preserved_or_retired_direct_path(self):
        contract = json.loads((ROOT / 'ops/release/migration-contract.json').read_text())
        policy = json.loads((ROOT / 'ops/release/legacy-index-policy.json').read_text())
        manifest = json.loads((ROOT / 'ops/release/preservation-manifest.json').read_text())
        expected = {row['source_path'] for row in contract['rows']
                    if row['disposition'].startswith('200_STATIC_')
                    or (row['disposition'] == '410_RETIRE' and
                        row['source_path'].startswith('/wp-content/uploads/'))}
        self.assertEqual({row['path'] for row in policy['rows']}, expected)
        self.assertEqual(len(policy['rows']), 84)
        manifest_paths = {row['path'] for row in manifest['files']}
        for row in policy['rows']:
            self.assertEqual(row['indexability'], 'NOINDEX')
            self.assertEqual(row['x_robots_tag'], 'noindex, nofollow, noarchive')
            self.assertEqual(row['canonical'], 'NONE')
            if row['response_status'] == 200:
                self.assertIn(row['artifact_path'], manifest_paths)
                if row['content_type'] == 'text/html':
                    self.assertEqual(row['html_meta_robots'], 'noindex,nofollow,noarchive')
            else:
                self.assertEqual(row['response_status'], 410)

    def test_legacy_html_and_feed_sanitization(self):
        html = (b'<html><head><meta name="robots" content="index,follow">'
                b'<link rel="canonical" href="https://dentix.ua/old/"></head><body>Archive</body></html>')
        clean = preservation.preserved_html(html)
        self.assertIn(b'noindex,nofollow,noarchive', clean)
        self.assertNotIn(b'canonical', clean)
        self.assertNotIn(b'index,follow', clean)
        self.assertRaises(ValueError, preservation.preserved_html, html + b'<form></form>')
        self.assertRaises(ValueError, preservation.preserved_html, html + b'<script></script>')
        feed = preservation.minimal_feed('/feed/')
        self.assertIn(b'<rss', feed)
        self.assertNotIn(b'<item>', feed)


if __name__ == '__main__':
    unittest.main()
