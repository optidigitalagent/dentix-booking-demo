import gzip
import importlib.util
import json
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
        self.assertEqual(len(paths), 49)
        self.assertEqual(len(manifest['files']), 49)
        self.assertFalse(any(row['disposition'] == 'HOLD_FOR_CONFIRMATION' for row in contract['rows']))
        self.assertEqual(len(aliases['aliases']), aliases['known_count'])
        targets = {row['path'] for row in json.loads((ROOT / 'ops/release/routes.json').read_text())['routes']} | paths
        for alias in aliases['aliases']:
            if alias['target_path']:
                self.assertIn(alias['target_path'], targets)
            else:
                self.assertEqual(alias['disposition'], '410_RETIRE')


if __name__ == '__main__':
    unittest.main()
