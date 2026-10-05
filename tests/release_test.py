"""Release contract regression tests; no external requests or deployment."""
import copy, importlib.util, json, re, tempfile, unittest, shutil
from pathlib import Path
spec=importlib.util.spec_from_file_location('release',Path(__file__).resolve().parents[1]/'scripts/release.py');release=importlib.util.module_from_spec(spec);spec.loader.exec_module(release)

class ReleaseTests(unittest.TestCase):
    def setUp(self): self.contract=release.read_json(release.OPS/'migration-contract.json')
    def _assert_professional_review(self,packet,reviewed):
        self.assertEqual(len(packet['pages']),len(reviewed['pages']))
        for current,baseline in zip(packet['pages'],reviewed['pages']):
            self.assertEqual(current,baseline)
    def test_canonical_dispositions(self): self.assertEqual(release.validate_contract(self.contract)['hold'],0)
    def test_preservation_cannot_become_404_or_home(self):
        row=next(r for r in self.contract['rows'] if r['disposition']=='200_STATIC_PRESERVE_MEDIA')
        for key,value in [('target_status',404),('target_path','/'),('disposition','410')]:
            bad=copy.deepcopy(self.contract);next(r for r in bad['rows'] if r['source_url']==row['source_url'])[key]=value
            with self.assertRaises(ValueError):release.validate_contract(bad)
        self.assertEqual(release.plan_response(row['source_url'],self.contract)['status'],200)
    def test_exact_missing_probe_is_keep_404(self): self.assertEqual(release.plan_response('https://dentix.ua/sitemap_index.xml',self.contract)['status'],404)
    def test_redirects_preserve_query_and_path(self):
        for url in ['http://dentix.ua/implantatsiya/?utm_source=chatgpt.com&a=1%2F2','https://www.dentix.ua/implantatsiya/?utm_source=chatgpt.com&a=1%2F2']:
            self.assertEqual(release.plan_response(url,self.contract),{'status':301,'location':'https://dentix.ua/implantatsiya/?utm_source=chatgpt.com&a=1%2F2'})
    def test_sitemap_redirect_is_gated(self):
        for row in self.contract['rows']:
            if row['disposition']=='301_EXACT_REPLACEMENT' and 'sitemap' in row['source_path']:
                self.assertIsNone(release.plan_response(row['source_url'],self.contract)['status'])
                self.assertEqual(release.plan_response(row['source_url'],self.contract,True),{'status':301,'location':'https://dentix.ua/sitemap.xml'})
    def test_commercial_routes_and_410(self):
        for row in self.contract['rows']:
            if row['disposition']=='200_REBUILD_SAME_URL':self.assertEqual(release.plan_response(row['source_url'],self.contract)['status'],200)
            if row['disposition']=='410_RETIRE':self.assertEqual(release.plan_response(row['source_url'],self.contract)['status'],410)
        for route in release.routes():self.assertEqual(release.plan_response(route['canonical'],self.contract)['status'],200)
        self.assertEqual(release.plan_response('https://dentix.ua/implantatsiya',self.contract)['status'],301)
    def test_functional_legacy_query_never_disappears(self):
        for query in ['p=1','page_id=538','attachment_id=694','feed=rss2']:
            self.assertEqual(release.plan_response('https://dentix.ua/?'+query,self.contract)['status'],301)
        for query in ['page_id=2','attachment_id=3','s=example','PAGE_ID=99999','%70=1','p=1&p=99999','p=1&attachment_id=3']:
            self.assertEqual(release.plan_response('https://dentix.ua/?'+query,self.contract)['status'],410)
        with self.assertRaises(ValueError):release.plan_response('https://foreign.example/',self.contract)
    def test_deterministic_artifact_and_review(self):
        first=release.verify_artifact(release.ROOT/'dist/production');second=release.verify_artifact(release.ROOT/'dist/production');self.assertEqual(first,second)
        packet=release.review_package(release.ROOT/'dist/production')
        reviewed=release.read_json(release.ROOT/'ops/review/professional-review.json')
        self._assert_professional_review(packet,reviewed)
        self.assertEqual(len(packet['pages']),12);self.assertEqual(sum(len(p['schema_service']) for p in packet['pages']),8)
        for p in packet['pages']:
            self.assertTrue(p['source_keys']);self.assertIsNone(p['reviewer_name']);self.assertIsNone(p['sign_off']);self.assertIsNone(p['decision'])
    def test_professional_review_rejects_clinical_mutations(self):
        packet=release.review_package(release.ROOT/'dist/production')
        reviewed=release.read_json(release.ROOT/'ops/review/professional-review.json')
        self._assert_professional_review(packet,reviewed)  # Legitimate conversion delta.
        mutations=[
            ('answer',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['visible_answer'].__setitem__(0,'Changed answer')),
            ('scope',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['scope'].__setitem__(0,'Changed scope')),
            ('exact_visible_blocks',lambda p: p['pages'][4]['exact_visible_blocks'][0].update(text='Changed clinical heading')),
            ('team_copy',lambda p: p['pages'][0]['team_copy'].__setitem__(0,'Changed doctor/team copy')),
            ('prices',lambda p: p['pages'][10]['prices'][0]['cost'].__setitem__(0,'0 грн')),
            ('clinicians',lambda p: p['pages'][1]['clinicians'][0]['name'].__setitem__(0,'Changed clinician')),
            ('schema_service',lambda p: p['pages'][4]['schema_service'][0].update(description='Changed clinical Schema')),
            ('microscope_provider',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['schema_service'][0].update(provider={'@id':'https://foreign.example/#doctor'})),
            ('doctor_as_service_provider',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['schema_service'][0].update(provider=[{'@id':'https://dentix.ua/#dentist'},{'@id':'https://dentix.ua/#person-albert-podolyansky'}])),
            ('area_served',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['schema_service'][0].update(areaServed={'@type':'City','name':'Київ'})),
            ('doctor_works_for',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['schema_people'][0].update(worksFor={'@id':'https://foreign.example/#dentist'})),
            ('clinic_employee',lambda p: next(page for page in p['pages'] if page['url'].endswith('/lechenie-pod-mikroskopom/'))['schema_clinic_employee'].__setitem__(0,{'@id':'https://foreign.example/#person'})),
        ]
        for name,mutate in mutations:
            with self.subTest(field=name):
                changed=copy.deepcopy(packet);mutate(changed)
                with self.assertRaises(AssertionError):self._assert_professional_review(changed,reviewed)
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
    def test_host_staging_gate_and_unexecuted_checklists(self):
        host=release.read_json(release.OPS/'hosting-decision.json');self.assertEqual(host['decision'],'CURRENT_ORIGIN_CANDIDATE_STAGING_REPLAY_PASSED');self.assertEqual(host['recommended_candidate'],'current_origin_mirohost_for_separate_go_review');self.assertFalse(host['cutover_authorized']);self.assertEqual(len(host['candidates']),3)
        self.assertEqual(host['candidates'][0]['status'],'CURRENT_ORIGIN_CANDIDATE_STAGING_REPLAY_PASSED')
        for candidate in host['candidates']:self.assertEqual(len(candidate['scores']),13)
        checks=release.read_json(release.OPS/'checklists.json');self.assertFalse(checks['launch_authorized']);self.assertTrue(all(c['status']=='NOT_EXECUTED' and c['executed_at'] is None for c in checks['checklists']))
if __name__=='__main__':unittest.main()
