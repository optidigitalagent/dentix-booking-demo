#!/usr/bin/env python3
"""Host-independent, local-only PR05 controls. Standard library; no network or deployment."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote, parse_qsl
import argparse, csv, hashlib, io, json, re, subprocess, zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OPS = ROOT / 'ops/release'
EXPECTED = {'KEEP': 3, 'REBUILD_SAME_URL': 4, '301': 7, '410': 1, 'HOLD_FOR_CONFIRMATION': 49}
ORIGIN = 'https://dentix.ua'
def sha(data): return hashlib.sha256(data).hexdigest()
def read_json(path): return json.loads(Path(path).read_text())
def encoded(data): return (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()
def write_json(path, data): Path(path).write_bytes(encoded(data))
def git(*args): return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()
def require(condition, message):
    if not condition: raise ValueError(message)
def routes(): return read_json(OPS / 'routes.json')['routes']
def migration_rows(): return list(csv.DictReader(io.StringIO((ROOT / '.seo/redirect-map.csv').read_text())))

class Element:
    def __init__(self, tag='', attrs=()): self.tag, self.attrs, self.children = tag, dict(attrs), []
    def all(self, tag=None, cls=None, ident=None):
        found = []
        for node in self.children:
            if isinstance(node, Element):
                if (tag is None or node.tag == tag) and (cls is None or cls in node.attrs.get('class', '').split()) and (ident is None or node.attrs.get('id') == ident): found.append(node)
                found.extend(node.all(tag, cls, ident))
        return found
    def text(self): return ''.join(c.text() if isinstance(c, Element) else c for c in self.children)
    def visible(self):
        if self.tag in ['script', 'style']: return ''
        # Preserve authored text verbatim; block boundaries are separately represented.
        return ''.join(c.visible() if isinstance(c, Element) else c for c in self.children)
class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True); self.root = Element(); self.stack = [self.root]; self.feed(html)
    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs); self.stack[-1].children.append(node)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.stack.append(node)
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag, attrs); self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag: self.stack = self.stack[:i]; break
    def handle_data(self, data): self.stack[-1].children.append(data)
def texts(doc, tag=None, cls=None, ident=None): return [n.text() for n in doc.all(tag, cls, ident)]
def attribute(doc, tag, selector, value, attr): return [n.attrs.get(attr) for n in doc.all(tag) if n.attrs.get(selector) == value]
def graph(doc):
    blocks = [json.loads(n.text()) for n in doc.all('script') if n.attrs.get('type') == 'application/ld+json']
    return [n for b in blocks for n in b.get('@graph', [b])]

def derive_contract(observations):
    observed = {r['url']: r for r in observations}; result = []
    for row in migration_rows():
        url = urlsplit(row['source_url']); target = urlsplit(row['target_url']) if row['target_url'] else None
        state = row['status']; observation = observed[row['source_url']]
        response = {'KEEP': '200_KEEP', 'REBUILD_SAME_URL': '200_REBUILD_SAME_URL', '301': '301', '410': '410', 'HOLD_FOR_CONFIRMATION': 'HOLD'}[state]
        status = 200 if state in ['KEEP', 'REBUILD_SAME_URL'] else int(state) if state in ['301', '410'] else None
        if state == 'KEEP' and row['normalized_path'] == '/sitemap_index.xml': response, status = '404_KEEP', 404
        hold = state == 'HOLD_FOR_CONFIRMATION'
        result.append({'source_url': row['source_url'], 'source_host': url.netloc, 'source_path': url.path or '/', 'source_scheme': url.scheme,
            'current_observed_status': observation['initial_status'], 'observed_final_status': observation['status'], 'observed_final_url': observation['effective_url'], 'observation_status': observation['observation_status'],
            'disposition': state, 'target_path': target.path if target else None, 'target_status': status,
            'required_response': response, 'query_policy': 'PRESERVE_VERBATIM; functional WordPress query aliases require legacy-origin handling and separate inventory; never discard or reinterpret',
            'slash_policy': 'Exact source paths; only the twelve replacement directory routes gain a trailing slash; HOLD paths untouched',
            'canonical_host_policy': 'HTTPS_APEX_PATH_QUERY_PRESERVED', 'owner': row['owner'], 'reviewer': row['review_required'],
            'evidence_date': observation['observed_at'], 'canonical_evidence_date': row['evidence_date'], 'canonical_reason': row['reason'],
            'cutover_test': 'Compare status, Location, path/query and fingerprint with approved preservation receipt' if hold else f'GET and HEAD: exact {status}; verify target and canonical; query case; no loop',
            'prerequisites': ['OWNER_APPROVED_LEGACY_ORIGIN_OR_STATIC_PRESERVATION', 'ALL_DEPENDENT_MEDIA_AND_FEEDS_TESTED'] if hold else ['REPLACEMENT_SITEMAP_200_AND_VALIDATED'] if state == '301' and 'sitemap' in url.path else ['OWNER_CONFIRMS_RETIREMENT_AND_LINK_CHECK'] if state == '410' else ['HOST_ADAPTER_STAGING_QA'],
            'preservation': {'status': 'UNRESOLVED_CUTOVER_BLOCKER', 'strategy': 'LEGACY_ORIGIN_PROXY_PREFERRED_IF_ACCESS_PROVEN; static preservation or explicit owner disposition are alternatives', 'legacy_origin': None, 'owner_approval': None, 'receipt': None} if hold else None,
            'rollback_expectation': 'Restore old origin and exact pre-cutover routing/robots state; verify observed status chain and critical content fingerprint',
        })
    return {'schema_version': 1, 'site_id': 'DENTIX', 'status': 'PLANNING_CONTRACT_NOT_DEPLOYED', 'canonical_map_sha256': sha((ROOT/'.seo/redirect-map.csv').read_bytes()), 'disposition_totals': EXPECTED,
        'keep_404_exception': '/sitemap_index.xml was explicitly KEEP genuine 404 in the source map; 404_KEEP preserves that disposition. It is never 200_KEEP and is not a HOLD conversion.',
        'unmapped_query_policy': 'BLOCK_CUTOVER_PENDING_LEGACY_QUERY_INVENTORY; do not route ?p=, ?page_id=, feed or attachment selectors into the React homepage',
        'rows': result}

def validate_contract(contract):
    rows = migration_rows(); actual = contract['rows']
    require(contract['canonical_map_sha256'] == sha((ROOT/'.seo/redirect-map.csv').read_bytes()), 'Canonical map hash drift')
    require(len(rows) == len(actual) == 64, 'Migration count')
    require({k: sum(r['disposition'] == k for r in actual) for k in EXPECTED} == EXPECTED == contract['disposition_totals'], 'Migration totals')
    for original, row in zip(rows, actual):
        require(row['source_url'] == original['source_url'] and row['disposition'] == original['status'], 'Silent disposition/source drift')
        target = urlsplit(original['target_url']).path if original['target_url'] else None
        require(row['target_path'] == target, 'Silent target drift')
        u = urlsplit(row['source_url'])
        require(row['source_host'] == u.netloc and row['source_path'] == (u.path or '/') and row['source_scheme'] == u.scheme, 'Source components drift')
        expected = {'KEEP': ('200_KEEP', 200), 'REBUILD_SAME_URL': ('200_REBUILD_SAME_URL', 200), '301': ('301', 301), '410': ('410', 410), 'HOLD_FOR_CONFIRMATION': ('HOLD', None)}[original['status']]
        if original['normalized_path'] == '/sitemap_index.xml': expected = ('404_KEEP', 404)
        require((row['required_response'], row['target_status']) == expected, 'Required response/status drift')
        for field in ['query_policy','slash_policy','canonical_host_policy','owner','reviewer','evidence_date','cutover_test','rollback_expectation','prerequisites']:
            require(row[field], 'Missing migration field: ' + field)
        if row['disposition'] == 'HOLD_FOR_CONFIRMATION':
            require(row['preservation']['status'] == 'UNRESOLVED_CUTOVER_BLOCKER' and row['preservation']['legacy_origin'] is None and row['preservation']['owner_approval'] is None, 'Unproven HOLD execution')
        if row['disposition'] == 'REBUILD_SAME_URL': require(row['source_path'] == row['target_path'], 'Commercial path changed')
        if row['disposition'] == '301' and 'sitemap' in row['source_path']: require('REPLACEMENT_SITEMAP_200_AND_VALIDATED' in row['prerequisites'], 'Premature sitemap redirect')
    return {'status': 'PASS', 'rows': 64, 'hold': 49, 'totals': EXPECTED}

def plan_response(url, contract, sitemap_ready=False):
    """Pure contract oracle, never a server adapter. None status means launch blocker."""
    u = urlsplit(url); require(u.hostname in ['dentix.ua', 'www.dentix.ua'] and u.scheme in ['http','https'], 'Foreign URL')
    if u.scheme != 'https' or u.netloc != 'dentix.ua': return {'status': 301, 'location': ORIGIN + (u.path or '/') + ('?' + u.query if u.query else '')}
    if any(k.lower() in {'p','page_id','attachment_id','feed','s'} for k, _ in parse_qsl(u.query, keep_blank_values=True)): return {'status': None, 'blocker': 'LEGACY_FUNCTIONAL_QUERY_REQUIRES_PRESERVATION'}
    row = next((r for r in contract['rows'] if r['source_url'] == ORIGIN + (u.path or '/')), None)
    if row:
        if row['required_response'] == 'HOLD': return {'status': None, 'blocker': 'HOLD_PRESERVATION_UNRESOLVED'}
        if 'REPLACEMENT_SITEMAP_200_AND_VALIDATED' in row['prerequisites'] and not sitemap_ready: return {'status': None, 'blocker': 'SITEMAP_NOT_READY'}
        result = {'status': row['target_status']}
        if result['status'] == 301: result['location'] = ORIGIN + row['target_path'] + ('?' + u.query if u.query else '')
        return result
    paths = [r['path'] for r in routes()]
    if u.path in paths: return {'status': 200}
    if u.path + '/' in paths: return {'status': 301, 'location': ORIGIN + u.path + '/' + ('?' + u.query if u.query else '')}
    return {'status': 404, 'note': 'Only after complete legacy path/query inventory and host validation; this oracle is not deployed'}

def file_manifest(root):
    result = []
    for p in sorted(Path(root).rglob('*')):
        require(not p.is_symlink(), 'Symlink in artifact')
        if p.is_file(): result.append({'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size, 'sha256': sha(p.read_bytes())})
    return result

def verify_artifact(root):
    root = Path(root).resolve(); expected = routes()
    require(len(expected) == 12 and len({r['path'] for r in expected}) == 12, 'Twelve unique routes required')
    html_files = {p.relative_to(root).as_posix() for p in root.rglob('*.html')}
    require(html_files == {r['artifact'] for r in expected} | {'404.html'}, 'Unexpected/missing HTML artifact')
    docs = {}; titles=[]; descriptions=[]; headings=[]
    for route in expected:
        html = (root/route['artifact']).read_text(); doc=Document(html).root; docs[route['path']]=doc
        require('dentix-booking-demo' not in html and 'noindex' not in html, 'Preview marker in patient HTML')
        title=texts(doc,'title'); h1=texts(doc,'h1'); desc=attribute(doc,'meta','name','description','content')
        require(title == [route['title']] and desc == [route['description']] and len(h1)==1, 'Metadata/H1 mismatch')
        require(all(re.search('[А-Яа-яІіЇїЄєҐґ]', v) for v in title+desc+h1), 'Ukrainian metadata required')
        require(attribute(doc,'meta','name','robots','content') == ['index,follow'], 'Production index policy')
        require(attribute(doc,'link','rel','canonical','href') == [route['canonical']], 'Self canonical required')
        nodes=graph(doc); require(any(n.get('@type')=='Dentist' for n in nodes), 'Missing entity graph')
        if route['key'] not in ['home','price','doctors','contacts']:
            services=[n for n in nodes if n.get('@type')=='Service']; require(len(services)==1, 'Service graph')
            require(services[0]['name']==h1[0] and services[0]['description']==texts(doc,ident='service-answer')[0], 'Visible Service parity')
            require(attribute(doc,'section','id','service-prices','data-content-source')==['local-fallback'], 'Managed price fallback missing')
            if route['key'] in ['surgery','extraction','wisdom','implantation','prosthetics']:
                require(not doc.all(cls='doc') and not any(n.get('@type')=='Person' for n in nodes), 'Unapproved clinician')
        titles.extend(title); descriptions.extend(desc); headings.extend(h1)
    require(all(len(set(values))==12 for values in [titles,descriptions,headings]), 'Nonunique head')
    locs=[n.text for n in ET.parse(root/'sitemap.xml').getroot().iter() if n.tag.endswith('}loc')]
    require(sorted(locs)==sorted(r['canonical'] for r in expected), 'Sitemap route parity')
    robots=(root/'robots.txt').read_text(); require(robots == 'User-agent: *\nAllow: /\n\nSitemap: https://dentix.ua/sitemap.xml\n', 'Unreviewed crawler policy; Google/Bing/OAI search must be allowed')
    error=Document((root/'404.html').read_text()).root
    require(attribute(error,'meta','name','robots','content')==['noindex,nofollow,noarchive'] and not attribute(error,'link','rel','canonical','href') and not error.all('script'), '404 index/app policy')
    for url,doc in docs.items():
        for node in doc.all():
            for key in ['href','src','poster']:
                value=node.attrs.get(key)
                if not value: continue
                u=urlsplit(urljoin(ORIGIN+url,value))
                if u.scheme not in ['http','https'] or u.netloc!='dentix.ua': continue
                relative=unquote(u.path).lstrip('/'); dest=(root/(relative+'index.html' if not relative or relative.endswith('/') else relative)).resolve()
                require(dest.is_relative_to(root) and dest.is_file(), 'Unresolved link/asset '+value)
                if u.fragment:
                    target=docs.get(u.path) or Document(dest.read_text()).root
                    require(target.all(ident=unquote(u.fragment)), 'Missing fragment '+value)
    files=file_manifest(root)
    for row in files:
        require(not any(part in ['admin','.env','node_modules','.git','.DS_Store'] for part in Path(row['path']).parts), 'Private/admin artifact')
        data=(root/row['path']).read_bytes()
        if Path(row['path']).suffix in ['.html','.js','.css','.json','.txt','.xml']:
            text=data.decode('utf8'); require(not re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-proj-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}',text), 'Credential pattern')
            require('/dentix-booking-demo/' not in text and 'AdminCrm' not in text and 'data-demo-surface="admin"' not in text, 'Preview/admin code')
    for row in files:
        p = root / row['path']
        if p.suffix in ['.css', '.html']:
            for value in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)', p.read_text()):
                u = urlsplit(urljoin(ORIGIN + '/' + row['path'], value.strip()))
                if u.scheme in ['http', 'https'] and u.netloc == 'dentix.ua':
                    dest = (root / unquote(u.path).lstrip('/')).resolve()
                    require(dest.is_relative_to(root) and dest.is_file(), 'Unresolved CSS asset ' + value)
    home = docs['/'].visible()
    require('Стасюк Станіслав Ігорович' in home and 'Засновник клініки та головний лікар' in home, 'Founder copy missing')
    for relative in ['media/dentix-clinic-tour.mp4', 'media/dentix-clinic-tour-poster.webp']:
        require(sha((root/relative).read_bytes()) == sha((ROOT/'public'/relative).read_bytes()), 'Founder media source mismatch')
    vite = read_json(root/'.vite/manifest.json')
    source = 'src/assets/dentix-content/doctors/stanislav-stasiuk.webp'
    require(source in vite and sha((root/vite[source]['file']).read_bytes()) == sha((ROOT/source).read_bytes()), 'Founder portrait source mismatch')
    return {'status':'PASS','patient_routes':12,'files':files,'content_sha256':sha(encoded(files)), 'http_status_limit':'Static verification; local browser/HTTP and future host adapter checks are separate'}

def review_package(root):
    entries=[]
    source_files=sorted(p for p in git('ls-files','src').splitlines() if Path(p).suffix in ['.tsx','.ts'])
    for route in routes():
        doc=Document((Path(root)/route['artifact']).read_text()).root
        service=route['key'] not in ['home','price','doctors','contacts']
        family='implant-prosthetics' if route['key'] in ['implantation','prosthetics'] else 'surgery' if route['key'] in ['surgery','extraction','wisdom'] else 'therapy'
        source_keys=[route['source_key'],'src/data/prices.ts:priceBlocks','src/data/doctors.ts:doctors','src/components/TeamSection.tsx:TeamSection']
        if service: source_keys += [f'src/data/{family}-pages.ts:' + {'therapy':'therapyPages','surgery':'surgeryPages','implant-prosthetics':'implantProstheticsPages'}[family] + '.' + route['key'], {'therapy':'src/TherapyPage.tsx','surgery':'src/SurgeryPage.tsx','implant-prosthetics':'src/ImplantProstheticsPage.tsx'}[family]]
        nodes=graph(doc)
        entry={'url':route['canonical'],'artifact':route['artifact'],'title':texts(doc,'title')[0], 'h1':texts(doc,'h1')[0],
            'visible_answer':texts(doc,ident='service-answer'), 'scope':texts(doc,ident='service-scope'),
            'questions':[{'question':texts(n,'summary'),'answer':texts(n,'p')} for n in doc.all('details')],
            'prices':[{'name':texts(n,cls='price-name'),'cost':texts(n,cls='price-cost'),'note':texts(n,cls='price-row-note')} for n in doc.all(cls='price-row')],
            'clinicians':[{'name':texts(n,'h3'),'role':texts(n,cls='doc-role'),'description':texts(n,cls='doc-description')} for n in doc.all(cls='doc')],
            'clinician_state':'DISPLAYED' if doc.all(cls='doc') else 'NO_CLINICIAN_DISPLAYED', 'team_copy':texts(doc,ident='team'),
            'schema_service':[{'name':n['name'],'description':n['description']} for n in nodes if n.get('@type')=='Service'],
            'exact_visible_blocks':[{'tag':n.tag,'text':n.visible()} for n in doc.all() if n.tag in ['h1','h2','h3','p','li','summary','figcaption'] and n.visible()],
            'source_keys':source_keys,'copy_source_sha':git('log','-1','--format=%H','--','src/data','src/page-metadata.ts','src/components/TeamSection.tsx'),
            'copy_change_date':git('log','-1','--format=%cI','--','src/data','src/page-metadata.ts','src/components/TeamSection.tsx'),
            'decision':None,'allowed_decisions':['APPROVE','CHANGE_REQUIRED','NOT_APPLICABLE'],'reviewer_name':None,'reviewer_role':None,'review_date':None,'sign_off':None,'required_changes':None}
        entries.append(entry)
    return {'schema_version':1,'status':'UNKNOWN / NOT_COMPLETED','scope':'Exact local production fallback copy on all twelve patient pages; all eight Service graphs. No clinical review performed. Runtime content must be reviewed separately before enabling managed content.',
        'source_files':{p:sha((ROOT/p).read_bytes()) for p in source_files},'pages':entries}

def package(destination):
    dest=Path(destination).resolve(); require(not dest.is_relative_to(ROOT), 'Archive must be outside repository')
    require(not git('status','--porcelain','--untracked-files=no'), 'Commit final reviewed source first')
    head=git('rev-parse','HEAD')
    subprocess.run(['node', 'scripts/build-release.mjs'], cwd=ROOT, check=True)
    require(head == git('rev-parse','HEAD') and not git('status','--porcelain','--untracked-files=no'), 'Source changed during release build')
    root=ROOT/'dist/production'; validation=verify_artifact(root)
    acceptance=read_json(OPS/'acceptance.json')
    require(acceptance['status'] == 'PASS_LOCAL_DRAFT_CANDIDATE' and validation['content_sha256'] == acceptance['production_content_sha256'], 'Rebuilt artifact differs from accepted QA bytes')
    manifest={'schema_version':1,'site_id':'DENTIX','repository':'optidigitalagent/dentix-booking-demo','source_sha':head,'source_tree':git('rev-parse','HEAD^{tree}'),'commit_time':git('show','-s','--format=%cI',head),'status':'LOCAL_CANDIDATE_NOT_LAUNCHED','booking_enabled':False,'environment_contract_sha256':sha((OPS/'environment.json').read_bytes()),**validation}
    payload={f'artifact/{r["path"]}':(root/r['path']).read_bytes() for r in validation['files']}
    payload['release-manifest.json']=encoded(manifest);payload['route-manifest.json']=(OPS/'routes.json').read_bytes()
    payload['SHA256SUMS.txt']=''.join(f'{sha(b)}  {n}\n' for n,b in sorted(payload.items())).encode()
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,data in sorted(payload.items()):
            info=zipfile.ZipInfo(name,(2026,9,13,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,data,compresslevel=9)
    data=buf.getvalue();dest.write_bytes(data)
    return {'path':str(dest),'bytes':len(data),'sha256':sha(data),'head':head,'content_sha256':validation['content_sha256'],'manifest':manifest}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('command',choices=['derive','verify','review','package']);parser.add_argument('--observations');parser.add_argument('--artifact',default=str(ROOT/'dist/production'));parser.add_argument('--output');args=parser.parse_args()
    if args.command=='derive':
        require(args.observations,'--observations required');result=derive_contract(read_json(args.observations));validate_contract(result);write_json(OPS/'migration-contract.json',result)
    elif args.command=='verify': result={'contract':validate_contract(read_json(OPS/'migration-contract.json')),'artifact':verify_artifact(args.artifact)}
    elif args.command=='review': result=review_package(args.artifact);write_json(ROOT/'ops/review/professional-review.json',result)
    else: require(args.output,'--output required');result=package(args.output)
    if args.output and args.command!='package': write_json(args.output,result)
    print(json.dumps({k:v for k,v in result.items() if k not in ['files','rows','pages','source_files','manifest','artifact']},ensure_ascii=False))
if __name__=='__main__': main()
