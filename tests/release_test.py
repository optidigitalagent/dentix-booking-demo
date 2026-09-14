"""Release contract regression tests; no external requests or deployment."""
import copy, importlib.util, json, re, tempfile, unittest, shutil
from pathlib import Path
spec=importlib.util.spec_from_file_location('release',Path(__file__).resolve().parents[1]/'scripts/release.py');release=importlib.util.module_from_spec(spec);spec.loader.exec_module(release)
class ReleaseTests(unittest.TestCase):
    def setUp(self): self.contract=release.read_json(release.OPS/'migration-contract.json')
    def test_canonical_dispositions(self): self.assertEqual(release.validate_contract(self.contract)['hold'],49)
    def test_hold_cannot_become_404_or_home(self):
        row=next(r for r in self.contract['rows'] if r['required_response']=='HOLD')
        for key,value in [('target_status',404),('target_path','/'),('disposition','410')]:
            bad=copy.deepcopy(self.contract);next(r for r in bad['rows'] if r['source_url']==row['source_url'])[key]=value
            with self.assertRaises(ValueError):release.validate_contract(bad)
        self.assertIsNone(release.plan_response(row['source_url'],self.contract)['status'])
    def test_exact_missing_probe_is_keep_404(self): self.assertEqual(release.plan_response('https://dentix.ua/sitemap_index.xml',self.contract)['status'],404)
    def test_redirects_preserve_query_and_path(self):
        for url in ['http://dentix.ua/implantatsiya/?utm_source=chatgpt.com&a=1%2F2','https://www.dentix.ua/implantatsiya/?utm_source=chatgpt.com&a=1%2F2']:
            self.assertEqual(release.plan_response(url,self.contract),{'status':301,'location':'https://dentix.ua/implantatsiya/?utm_source=chatgpt.com&a=1%2F2'})
    def test_sitemap_redirect_is_gated(self):
        for row in self.contract['rows']:
            if row['disposition']=='301' and 'sitemap' in row['source_path']:
                self.assertIsNone(release.plan_response(row['source_url'],self.contract)['status'])
                self.assertEqual(release.plan_response(row['source_url'],self.contract,True),{'status':301,'location':'https://dentix.ua/sitemap.xml'})
    def test_commercial_routes_and_410(self):
        for row in self.contract['rows']:
            if row['disposition']=='REBUILD_SAME_URL':self.assertEqual(release.plan_response(row['source_url'],self.contract)['status'],200)
            if row['disposition']=='410':self.assertEqual(release.plan_response(row['source_url'],self.contract)['status'],410)
        for route in release.routes():self.assertEqual(release.plan_response(route['canonical'],self.contract)['status'],200)
        self.assertEqual(release.plan_response('https://dentix.ua/implantatsiya',self.contract)['status'],301)
    def test_functional_legacy_query_never_disappears(self):
        for query in ['p=1','page_id=2','attachment_id=3','feed=rss2','s=example','%70=1','PAGE_ID=1']:
            self.assertIsNone(release.plan_response('https://dentix.ua/?'+query,self.contract)['status'])
        with self.assertRaises(ValueError):release.plan_response('https://foreign.example/',self.contract)
    def test_deterministic_artifact_and_review(self):
        first=release.verify_artifact(release.ROOT/'dist/production');second=release.verify_artifact(release.ROOT/'dist/production');self.assertEqual(first,second)
        packet=release.review_package(release.ROOT/'dist/production');self.assertEqual(packet,release.read_json(release.ROOT/'ops/review/professional-review.json'))
        self.assertEqual(len(packet['pages']),12);self.assertEqual(sum(len(p['schema_service']) for p in packet['pages']),8)
        for p in packet['pages']:
            self.assertTrue(p['source_keys']);self.assertIsNone(p['reviewer_name']);self.assertIsNone(p['sign_off']);self.assertIsNone(p['decision'])
    def test_corrupt_artifacts_are_rejected(self):
        with tempfile.TemporaryDirectory(prefix='dentix-release-test-') as temp:
            artifact=Path(temp)/'production';shutil.copytree(release.ROOT/'dist/production',artifact)
            home=artifact/'index.html';original=home.read_text()
            for bad in [original.replace('index,follow','noindex,follow'),original.replace('href="https://dentix.ua/"','href="https://foreign.example/"'),original.replace('src="/assets/','src="/missing/')]:
                home.write_text(bad)
                with self.assertRaises(ValueError):release.verify_artifact(artifact)
            home.write_text(original)
            (artifact/'extra.html').write_text(original)
            with self.assertRaises(ValueError):release.verify_artifact(artifact)
    def test_review_prices_and_missing_clinicians(self):
        pages=release.read_json(release.ROOT/'ops/review/professional-review.json')['pages']
        implant=next(p for p in pages if p['url'].endswith('/implantatsiya/'));prosthetics=next(p for p in pages if p['url'].endswith('/protezirovanie/'))
        self.assertIn(['Імплант'],[r['name'] for r in implant['prices']]);self.assertIn(['Імплантація All-on-4 (Корея)'],[r['name'] for r in implant['prices']]);self.assertNotIn(['Імплантація All-on-4 (Корея)'],[r['name'] for r in prosthetics['prices']])
        self.assertIn(['У вартість входять імпланти та протезування на імплантах.'],[r['note'] for r in implant['prices']]);self.assertNotIn(['Під ключ.'],[r['note'] for r in prosthetics['prices']])
        self.assertEqual(implant['clinicians'],[]);self.assertEqual(prosthetics['clinicians'],[])
    def test_environment_inventory_and_disabled_candidate(self):
        env=release.read_json(release.OPS/'environment.json');names={r['name'] for r in env['variables']};candidate={r['name']:r['candidate_value'] for r in env['variables']}
        for p in (release.ROOT/'src').rglob('*'):
            if p.suffix in ['.ts','.tsx']:
                self.assertFalse(set(re.findall(r'VITE_DENTIX_[A-Z_]+',p.read_text()))-names)
        self.assertFalse(env['candidate_booking_enabled']);self.assertEqual(candidate['VITE_DENTIX_BOOKING_ENABLED'],'false')
        for key in ['VITE_DENTIX_CONTENT_API_URL','VITE_DENTIX_LEADS_API_URL','VITE_DENTIX_BOOKING_API_URL']:self.assertEqual(candidate[key],'')
        self.assertEqual(env['post_deploy_synthetic_checks']['status'],'NOT_AUTHORIZED_NOT_EXECUTED')
    def test_measurement_utm_and_access_boundaries(self):
        t0=release.read_json(release.OPS/'access-t0.json');self.assertEqual(len(t0['channels']),8);self.assertFalse(t0['requests_sent']);self.assertEqual(t0['numeric_capture']['windows_days'],[28,90]);self.assertTrue(all(r['value'] is None for r in t0['numeric_capture']['fields']))
        events=release.read_json(release.ROOT/'.seo/event-dictionary.yml')['events'];by_name={e['name']:e for e in events}
        for event in events:
            self.assertIn('phone',event['prohibited_parameters']);self.assertIn('form_field_values',event['prohibited_parameters']);self.assertFalse(event['outcome_confirmed'])
        self.assertEqual(by_name['phone_click']['stage'],'intent');self.assertEqual(by_name['form_delivered_server']['stage'],'delivery');self.assertEqual(by_name['connected_call']['stage'],'connected_interaction')
        for route in release.routes():
            self.assertNotIn('?',route['canonical']);doc=release.Document((release.ROOT/'dist/production'/route['artifact']).read_text()).root
            for a in doc.all('a'):
                href=a.attrs.get('href','')
                if href.startswith('/') or href.startswith('https://dentix.ua'):self.assertNotIn('utm_',href)
        self.assertEqual(release.read_json(release.ROOT/'.seo/measurement-plan.yml')['outcome_report']['claims'],[])
    def test_no_host_selection_or_executed_checklists(self):
        host=release.read_json(release.OPS/'hosting-decision.json');self.assertEqual(host['decision'],'DECISION_PENDING_ACCESS');self.assertIsNone(host['recommended_candidate']);self.assertEqual(len(host['candidates']),3)
        for candidate in host['candidates']:self.assertEqual(len(candidate['scores']),13)
        checks=release.read_json(release.OPS/'checklists.json');self.assertFalse(checks['launch_authorized']);self.assertTrue(all(c['status']=='NOT_EXECUTED' and c['executed_at'] is None for c in checks['checklists']))
if __name__=='__main__':unittest.main()
