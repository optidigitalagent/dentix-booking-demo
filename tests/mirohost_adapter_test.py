import base64
import hashlib
import importlib.util
import json
import os
import pwd
import grp
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
MODULE_DIR = ROOT / 'ops/hosting/mirohost'
spec = importlib.util.spec_from_file_location('mirohost_adapter', MODULE_DIR / 'render_adapter.py')
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)
spec = importlib.util.spec_from_file_location('mirohost_staging', MODULE_DIR / 'prepare_staging.py')
staging = importlib.util.module_from_spec(spec)
spec.loader.exec_module(staging)
SHA = '9fddc64020fcdcf0e01020be838be72c75b1d4a8'


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


opener = build_opener(NoRedirect)


def request(port, path, method='GET', host='dentix.ua', https=True, auth=None):
    headers = {'Host': host}
    if https:
        headers['X-Forwarded-Proto'] = 'https'
    if auth:
        headers['Authorization'] = 'Basic ' + base64.b64encode(auth.encode()).decode()
    try:
        response = opener.open(Request(f'http://127.0.0.1:{port}{path}', headers=headers, method=method), timeout=4)
    except HTTPError as e:
        response = e
    with response:
        return response.code, dict(response.headers), response.read()


def apache_modules():
    base = next((p for p in (Path('/usr/libexec/apache2'), Path('/usr/lib/apache2/modules')) if p.exists()), None)
    exe = shutil.which('httpd') or shutil.which('apache2')
    names = ('mpm_prefork', 'authn_file', 'authn_core', 'authz_core', 'authz_user',
             'auth_basic', 'mime', 'dir', 'rewrite', 'headers', 'env', 'unixd', 'log_config')
    if not base or not exe or any(not (base / f'mod_{x}.so').exists() for x in names):
        return None, None
    return exe, [(x, base / f'mod_{x}.so') for x in names]


class ApacheServer:
    def __init__(self, root):
        self.root = Path(root)
        self.proc = None
        self.port = None

    def __enter__(self):
        exe, modules = apache_modules()
        if not exe:
            raise unittest.SkipTest('local Apache modules unavailable')
        sock = socket.socket()
        sock.bind(('127.0.0.1', 0))
        self.port = sock.getsockname()[1]
        sock.close()
        tmp = self.root.parent
        lines = [f'ServerRoot "{tmp}"', 'ServerName dentix.ua', f'Listen 127.0.0.1:{self.port}',
                 f'PidFile "{tmp / "httpd.pid"}"', f'ErrorLog "{tmp / "httpd.log"}"',
                 'LogLevel warn', f'User {pwd.getpwuid(os.getuid()).pw_name}',
                 f'Group {grp.getgrgid(os.getgid()).gr_name}']
        lines += [f'LoadModule {name}_module "{path}"' for name, path in modules]
        lines += [f'DocumentRoot "{self.root}"', f'<Directory "{self.root}">',
                  'Options FollowSymLinks', 'AllowOverride All', 'Require all granted', '</Directory>',
                  'AddType text/html .html', 'AddType application/xml .xml', 'AddType text/plain .txt']
        conf = tmp / 'httpd.conf'
        conf.write_text('\n'.join(lines) + '\n')
        self.proc = subprocess.Popen([exe, '-f', str(conf), '-DFOREGROUND'],
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                     start_new_session=True)
        for _ in range(100):
            if self.proc.poll() is not None:
                raise RuntimeError('Apache failed: ' + (tmp / 'httpd.log').read_text()[-1000:])
            try:
                with socket.create_connection(('127.0.0.1', self.port), timeout=.1):
                    return self
            except OSError:
                time.sleep(.03)
        raise RuntimeError('Apache did not start')

    def __exit__(self, *_):
        if self.proc:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.proc.kill()


class MirohostAdapterTest(unittest.TestCase):
    def test_contract_and_real_apache_replay(self):
        contract = json.loads((ROOT / 'ops/release/migration-contract.json').read_text())
        routes = json.loads((ROOT / 'ops/release/routes.json').read_text())['routes']
        with tempfile.TemporaryDirectory(prefix='dentix-apache-') as temp:
            docroot = Path(temp) / 'site'
            docroot.mkdir()
            for route in routes:
                p = docroot / route['artifact']
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(f'<html><title>{route["key"]}</title></html>')
            (docroot / '404.html').write_text('DENTIX_CUSTOM_404')
            (docroot / 'robots.txt').write_text('User-agent: *\nAllow: /')
            (docroot / 'sitemap.xml').write_text('<urlset/>')
            (docroot / 'media').mkdir()
            (docroot / 'media' / 'fixture.webp').write_bytes(b'WEBP_FIXTURE')
            rendered = adapter.render('production', SHA)
            self.assertIn('# RewriteRule ^sayt-nahoditsya-na-tehnicheskom-obsluzh/$', rendered)
            self.assertNotIn('ProxyPass', rendered)
            (docroot / '.htaccess').write_text(rendered)
            with ApacheServer(docroot) as server:
                for method in ('GET', 'HEAD'):
                    for route in routes:
                        status, headers, body = request(server.port, route['path'], method)
                        self.assertEqual(status, 200, (method, route['path'], body[:100]))
                        self.assertEqual(headers.get('X-Dentix-Release'), SHA)
                        for host, https in (('www.dentix.ua', True), ('dentix.ua', False)):
                            variant_status, variant_headers, _ = request(server.port, route['path'] + '?utm_source=qa', method, host, https)
                            self.assertEqual(variant_status, 301)
                            self.assertEqual(variant_headers['Location'], 'https://dentix.ua' + route['path'] + '?utm_source=qa')
                        if route['path'].endswith('/') and route['path'] != '/':
                            slash_status, slash_headers, _ = request(server.port, route['path'][:-1] + '?utm_source=qa', method)
                            self.assertEqual(slash_status, 301)
                            self.assertEqual(slash_headers['Location'], route['canonical'] + '?utm_source=qa')
                    for row in contract['rows']:
                        host = row['source_host']
                        https = row['source_scheme'] == 'https'
                        for suffix in ('', '?utm_source=qa'):
                            status, headers, body = request(server.port, row['source_path'] + suffix, method, host, https)
                            if row['disposition'] == 'HOLD_FOR_CONFIRMATION':
                                self.assertEqual(status, 503, row['source_path'])
                            elif row['disposition'] == '410':
                                self.assertEqual(status, 404, '410 must remain unexecuted')
                            elif row['disposition'] == '301' and row['source_path'].startswith('/wp-sitemap'):
                                self.assertEqual(status, 503, 'sitemap gate must stay closed')
                            else:
                                self.assertEqual(status, row['target_status'], row['source_url'])
                            if status == 301 and suffix:
                                self.assertTrue(headers['Location'].endswith(suffix), row['source_url'])
                    status, _, body = request(server.port, '/missing-probe', method)
                    self.assertEqual(status, 404)
                    if method == 'GET':
                        self.assertIn(b'DENTIX_CUSTOM_404', body)
                    status, headers, _ = request(server.port, '/likari?utm_source=test', method)
                    self.assertEqual(status, 301)
                    self.assertEqual(headers['Location'], 'https://dentix.ua/likari/?utm_source=test')
                    for query in ('?p=1', '?page_id=2', '?feed=rss2', '?attachment_id=3'):
                        self.assertEqual(request(server.port, '/' + query, method)[0], 503)
                    self.assertEqual(request(server.port, '/media/fixture.webp', method)[0], 200)
                    self.assertEqual(request(server.port, '/feed/', method)[0], 503)
                    self.assertEqual(request(server.port, '/wp-admin/', method)[0], 404)
                    status, headers, _ = request(server.port, '/likari/?utm_source=test', method, host='other.example')
                    self.assertEqual(status, 301)
                    self.assertEqual(headers['Location'], 'https://dentix.ua/likari/?utm_source=test')
                    self.assertEqual(request(server.port, '/likari/', method)[0], 200)
            (docroot / '.htaccess').write_text(adapter.render('production', SHA, sitemap_ready=True))
            with ApacheServer(docroot) as server:
                for row in (r for r in contract['rows'] if r['disposition'] == '301' and r['source_path'].startswith('/wp-sitemap')):
                    for method in ('GET', 'HEAD'):
                        status, headers, _ = request(server.port, row['source_path'] + '?utm_source=test', method)
                        self.assertEqual(status, 301)
                        self.assertEqual(headers['Location'], 'https://dentix.ua/sitemap.xml?utm_source=test')
            (docroot / '.htaccess').write_text(rendered.replace('# RewriteRule ^sayt-nahoditsya-na-tehnicheskom-obsluzh/$', 'RewriteRule ^sayt-nahoditsya-na-tehnicheskom-obsluzh/$'))
            with ApacheServer(docroot) as server:
                self.assertEqual(request(server.port, '/sayt-nahoditsya-na-tehnicheskom-obsluzh/')[0], 410)

    def test_noindex_basic_auth_and_candidate_integrity(self):
        routes = json.loads((ROOT / 'ops/release/routes.json').read_text())
        with tempfile.TemporaryDirectory(prefix='dentix-stage-') as temp:
            temp = Path(temp)
            archive = temp / 'candidate.zip'
            files = {'404.html': b'<meta name="robots" content="noindex,nofollow,noarchive" />',
                     'robots.txt': b'User-agent: *\nAllow: /\n'}
            for route in routes['routes']:
                files[route['artifact']] = b'<html><head><meta name="robots" content="index,follow" /></head><body>DENTIX</body></html>'
            manifest = {'site_id': 'DENTIX', 'source_sha': SHA, 'booking_enabled': False,
                        'files': [{'path': name, 'sha256': hashlib.sha256(data).hexdigest()} for name, data in files.items()]}
            with ZipFile(archive, 'w') as z:
                for name, data in files.items():
                    z.writestr('artifact/' + name, data)
                z.writestr('release-manifest.json', json.dumps(manifest))
                z.writestr('route-manifest.json', json.dumps(routes))
            original_hash = hashlib.sha256(archive.read_bytes()).hexdigest()
            with self.assertRaises(ValueError):
                staging.prepare(archive, ROOT / 'dist' / 'unapproved-staging')
            docroot = temp / 'isolated' / 'unpredictable-stage'
            receipt = staging.prepare(archive, docroot)
            self.assertEqual(receipt['candidate_sha256'], original_hash)
            self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), original_hash)
            self.assertEqual((docroot / 'robots.txt').read_text(), 'User-agent: *\nDisallow: /\n')
            secret = os.urandom(24).hex()
            password_file = temp / 'auth.users'
            password_file.write_text('reviewer:{SHA}' + base64.b64encode(hashlib.sha1(secret.encode()).digest()).decode() + '\n')
            (docroot / '.htaccess').write_text(adapter.render('staging', SHA, str(password_file)))
            with ApacheServer(docroot) as server:
                self.assertEqual(request(server.port, '/')[0], 401)
                for method in ('GET', 'HEAD'):
                    status, headers, body = request(server.port, '/', method, auth='reviewer:' + secret)
                    self.assertEqual(status, 200)
                    self.assertEqual(headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive')
                    if method == 'GET':
                        self.assertIn(b'noindex,nofollow,noarchive', body)
                    self.assertEqual(request(server.port, '/robots.txt', method, auth='reviewer:' + secret)[0], 200)
                    self.assertEqual(request(server.port, '/?p=1', method, auth='reviewer:' + secret)[0], 503)
                    self.assertEqual(request(server.port, '/sayt-nahoditsya-na-tehnicheskom-obsluzh/', method,
                                             auth='reviewer:' + secret)[0], 410)


if __name__ == '__main__':
    unittest.main()
