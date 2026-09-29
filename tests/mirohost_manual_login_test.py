import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / 'ops/hosting/mirohost/automation/runner.py'
spec = importlib.util.spec_from_file_location('dentix_mirohost_runner', MODULE)
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class ManualLoginStateTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='dentix-login-state-')
        root = Path(self.temp.name) / 'MirohostPR06'
        self.patches = [
            patch.object(runner, 'LOGIN_ROOT', root),
            patch.object(runner, 'LOGIN_STATUS', root / 'status.json'),
            patch.object(runner, 'LOGIN_MARKER', root / 'authenticated.json'),
            patch.object(runner, 'LOGIN_STORAGE', root / 'storage-state.json'),
        ]
        for item in self.patches:
            item.start()

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.temp.cleanup()

    def write(self, name, payload, mode=0o600):
        path = runner.LOGIN_ROOT / name
        path.write_text(json.dumps(payload))
        os.chmod(path, mode)

    def test_missing_and_clear_are_idempotent(self):
        self.assertEqual(runner.login_status()['status'], 'NOT_STARTED')
        self.assertEqual(runner.manual_login_clear()['status'], 'CLEARED')
        self.assertEqual(runner.manual_login_clear()['status'], 'CLEARED')

    def test_authentication_requires_private_valid_marker_and_storage(self):
        runner.login_dir(create=True)
        self.write('status.json', {'status': 'AUTHENTICATED', 'helper_pid': os.getpid()})
        self.write('authenticated.json', {'site_id': 'DENTIX', 'authenticated': True,
                                          'service_code_visible': True})
        self.write('storage-state.json', {'cookies': []})
        self.assertEqual(runner.login_status()['status'], 'AUTHENTICATED')
        os.chmod(runner.LOGIN_STORAGE, 0o644)
        self.assertEqual(runner.login_status()['status'], 'ERROR')

    def test_waiting_requires_live_helper(self):
        runner.login_dir(create=True)
        self.write('status.json', {'status': 'WAITING_FOR_USER', 'helper_pid': 99999999})
        self.assertEqual(runner.login_status()['status'], 'ERROR')


if __name__ == '__main__':
    unittest.main()
