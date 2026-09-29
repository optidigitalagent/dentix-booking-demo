# DENTIX PR-07 working handoff — 2026-09-29

Merged PR #9 is reconciled at c75d494945ba8868840f30bd82a12e78cc1bee14; current branch is seo/dentix-pr07-hold-resolution. Private WordPress backup integrity passed. Complete 28-day Mirohost log aggregates cover all 49 former HOLD paths; 90 days are unavailable. Four HTML, seven RSS/XML and 38 media paths have exact static decisions and an external 49-file bundle; no preservation bytes or raw logs are in Git. An extra attachment outside those 49 paths has a patient-consent decision pending and is excluded from the bundle. The existing isolated Basic-Auth/noindex staging passed the PR07 contract replay: 12 patient routes and all 64 migration rows GET/HEAD, 58 known aliases GET/HEAD, 107 remote hashes and 38 media Range checks; no generic homepage fallback, open proxy or loop. The replay used a precommit artifact with the same site bytes; an exact-head package/replay receipt is required after commit. Production WordPress, DNS, external accounts and indexing remain unchanged. Commit/push and Draft PR remain pending. `outcome_report.claims=[]`.

---

# DENTIX PR06 automated routine continuation — 2026-09-28T18:17:23.553890+00:00

Existing Draft PR #9 and branch `seo/dentix-pr06-mirohost-staging` reconciled at initial head `b64a30c36e6b6c2f5be7af5e2e6cd178ab33e134`. The package checksum, operator 0.2.1 immutable 213-file identity, ten skills, 163/163 operator tests, 25 unit tests, 34 artifact tests, 13 release tests, two local Apache adapter tests, eight local browser suites and one read-only live-preview suite passed. Fixture POST requests were intercepted; preview was restored after fixture QA. A separate temporary Playwright Chromium profile reached the Mirohost login form, but the single supplied control-panel credential attempt did not establish an authenticated session. No 2FA prompt was observed. One controlled explicit-FTPS attempt to the current server was blocked before any backup transfer. The panel allowlist was not changed; no temporary entry exists to remove. FileVault is on; no backup files were obtained.

The DENTIX-only reusable automation runner is fail closed for panel mutations and staging until exact live controls and a separate document root are verified. Remote staging, Basic Auth, noindex and HTTP QA remain **NOT_RUN**. The 64-row local replay is separate from remote capability; all 49 HOLD rows remain unresolved and none is counted as preserved. WordPress production is **NOT_LAUNCHED** for this React release. No production root, DNS, forms, integration, sitemap or index request changed. Credential rotation remains P0 before any future cutover. `outcome_report.claims=[]`.

---

# DENTIX PR06 staging handoff — 2026-09-28

Current base `9fddc64020fcdcf0e01020be838be72c75b1d4a8`; no open PR at entry; successful preview workflow `34840817204` at that SHA. Client correction `37def83` and review snapshot `9fddc64` are included. Branch `seo/dentix-pr06-mirohost-staging` is isolated from current main. Old WordPress remains live at `dentix.ua`; React production is `NOT_LAUNCHED`.

Public DNS A currently resolves to `89.184.75.186` with three Mirohost nameservers; current HTTP answers WordPress through nginx. The historical hosting document has a different IP; no DNS change is inferred. Full registrar zone, Mirohost root/capabilities, FTP allowlist, database and safe backup receipt need current panel access. One read-only FTPS attempt did not establish access and was not retried. Current host decision is `DECISION_PENDING_ACCESS_OR_CAPABILITY`.

The local Apache adapter, authentication/noindex overlay and 64-row GET/HEAD replay are under `ops/hosting/mirohost/` and `.seo/pr06-mirohost-staging.json`. All 49 HOLD rows remain cutover blockers; they return 503 in the local safety adapter, never a homepage or generic 404. The 410 is an unexecuted template; sitemap redirects remain gated. Remote staging requires proof of an isolated document root before any upload. No production root, DNS, database, content, forms, analytics or account setting was changed. Existing current facts/services have owner approval; no new medical claim is introduced, and a separate medical signature is not a blocker for existing approved copy. Credential rotation is P0 after backup/staging verification and before any later cutover. `outcome_report.claims=[]`.

## Historical PR05 handoff

PR05 pre-merge action snapshot at 2026-09-13T15:52:11.566982+00:00, expires 2026-09-13T18:52:11.566982+00:00. User-supplied DENTIX_AUTHORIZATION_PR05_READY_MERGE_PREVIEW_DEPLOY supersedes Draft-only scope for this bounded stage. PR #8 OPEN/Draft/MERGEABLE/CLEAN; base 6465964edb7ae549f5abac9194fad9bbd18f2d9d; reviewed initial head bfc4f5a3f4dfad8fc9c343d02b81f8ec301d38fd; exactly 37 changed paths; no overlapping PR or submitted review; NO_SERVER_CI. Operator 0.2.1 immutable identity: 213 matching files, ten skills, bundle/negative outcome/7 DENTIX path checks PASS. Independent source, evidence and production-readiness contract review PASS: implementation ZIP 98255717 bytes, SHA-256 0dca0c5dd6d3dafb248a4f05d26c49ed9a930549f7d56d50f1e139bb80c78dd9, 346/346 root checksums; nested mission manifest also verified. Release ZIP 22224867 bytes, SHA-256 debdf6cea23228d416fdd657812ee1568d6b5fb25fdc3abb5574b0bdb1716d42, 65 entries/64 checksums, source bfc4f5a3f4dfad8fc9c343d02b81f8ec301d38fd, twelve-route artifact/content manifest and exact review-copy parity PASS. Only patient behavior change is exact implantation/prosthetics requestedInterest. Hosting DECISION_PENDING_ACCESS; recommended_candidate=null. Canonical migration 64 rows: KEEP=3, REBUILD_SAME_URL=4, 301=7, 410=1, HOLD_FOR_CONFIRMATION=49. All 49 HOLD preservation UNRESOLVED_CUTOVER_BLOCKER; /sitemap_index.xml remains 404_KEEP; sitemap redirects gated. Professional review UNKNOWN / NOT_COMPLETED. GSC/GBP/GA4/GTM/Bing/CRM ACCESS_BLOCKED; call tracking UNKNOWN; T0 NOT_READY. Candidate booking=false, endpoints empty; no host adapter or backup/restore rehearsal executed. WordPress remains production; React NOT_LAUNCHED. Fresh exact-final-head suite, Ready, normal merge and one automatic noindex-preview deployment PENDING. No production/cutover, account mutation, sitemap/indexing, form delivery, appointment or release closure. outcome_report.claims=[]. Final head, Ready/merge/deployment and live-QA receipts remain external and in PR #8 body; no post-merge repository commit. Tracked/index clean flags describe the verified entry and commit/action boundary; unrelated .DS_Store files preserved.

.seo/release-state.yml continues to describe the last verified merged preview at 6465964edb7ae549f5abac9194fad9bbd18f2d9d. Production remains unverified and open. The outcome record below retains dated historical observations; it grants no current result or action. The current authorization.yml controls this stage.

# Outcome report

Record validation only; no aggregate SEO PASS. Claims are bounded to their supplied evidence and explicit as_of date, not automatically current.

| Channel | Status | Evidence IDs |
|---|---|---|
| technical | UNKNOWN |  |
| google_indexation | ACCESS_BLOCKED |  |
| google_organic | OBSERVED | organic-brand, organic-kalynova |
| google_maps | OBSERVED | maps-brand |
| ai_mention | OBSERVED | ai-mention-therapy |
| ai_site_citation | OBSERVED | ai-site-therapy |
| ai_third_party_citation | OBSERVED | ai-third-party-therapy |
| ai_referral | ACCESS_BLOCKED |  |
| conversion_delivery | UNKNOWN |  |
| business_outcome | UNKNOWN |  |

## Record details

```json
{
  "technical": {
    "status": "UNKNOWN",
    "reason": "PR04A/B/C merged to noindex preview only. PR #7 final head d4bc9bd20b1731b116d9d43ddf1c9447faffb884; merge/main 6465964edb7ae549f5abac9194fad9bbd18f2d9d; successful workflow 34759609171 / Pages deployment 6422001426 at same SHA; twelve live preview patient routes verified. PR05 local production-readiness controls and exact two requestedInterest seeds implemented; final validation/Draft publication receipts outside repository. No new service routes or medical copy. Hosting DECISION_PENDING_ACCESS; 64 migration rows unchanged, 49 HOLD preservation UNRESOLVED_CUTOVER_BLOCKER; KEEP 404 probe explicitly preserved. Review packet generated; professional review UNKNOWN / NOT_COMPLETED; no approved fallback surgeon/implantologist/orthopedist. WordPress remains production; React NOT_LAUNCHED. Candidate endpoints unset; booking disabled. GSC/GBP/GA4/GTM/Bing/CRM ACCESS_BLOCKED; call tracking UNKNOWN; T0 NOT_READY. Backups, host adapter, qualified sign-off and cutover authorization pending. outcome_report.claims=[]. Ready/merge/deploy/publish/accounts/indexing/release closure unauthorized.",
    "evidence_ids": []
  },
  "google_indexation": {
    "status": "ACCESS_BLOCKED",
    "reason": "GSC URL Inspection unavailable; site search and SERP observations do not establish indexed URL inventory.",
    "evidence_ids": []
  },
  "google_organic": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "organic-brand",
      "organic-kalynova"
    ]
  },
  "google_maps": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "maps-brand"
    ]
  },
  "ai_mention": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "ai-mention-therapy"
    ]
  },
  "ai_site_citation": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "ai-site-therapy"
    ]
  },
  "ai_third_party_citation": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "ai-third-party-therapy"
    ]
  },
  "ai_referral": {
    "status": "ACCESS_BLOCKED",
    "reason": "No authorized analytics referral dataset",
    "evidence_ids": []
  },
  "conversion_delivery": {
    "status": "UNKNOWN",
    "reason": "Intake lead/timed UNAVAILABLE in read-only status check; no receipt or connected-call evidence",
    "evidence_ids": []
  },
  "business_outcome": {
    "status": "UNKNOWN",
    "reason": "No real confirmed qualified-lead/booking/outcome aggregate evidence; no patient records accessed",
    "evidence_ids": []
  }
}
```

## Supplied observations (zero is a measured value)

```json
{
  "organic-brand": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "google_organic",
    "source": {
      "kind": "google_serp_sample",
      "id": "DENTIX-PR02-organic-brand"
    },
    "measured_at": "2026-09-12T12:03:32.550Z",
    "window": {
      "start": "2026-09-12T12:03:32.550Z",
      "end": "2026-09-12T12:03:32.550Z"
    },
    "scope": {
      "query": "DENTIX Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "site_presence_in_sample",
    "unit": "count",
    "value": 1,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production"
  },
  "organic-kalynova": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "google_organic",
    "source": {
      "kind": "google_serp_sample",
      "id": "DENTIX-PR02-organic-kalynova"
    },
    "measured_at": "2026-09-12T12:04:26.428Z",
    "window": {
      "start": "2026-09-12T12:04:26.428Z",
      "end": "2026-09-12T12:04:26.428Z"
    },
    "scope": {
      "query": "стоматологія Калинова Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "site_presence_in_sample",
    "unit": "count",
    "value": 1,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production"
  },
  "maps-brand": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "google_maps",
    "source": {
      "kind": "maps_sample",
      "id": "DENTIX-PR02-maps-brand"
    },
    "measured_at": "2026-09-12T12:12:57.751Z",
    "window": {
      "start": "2026-09-12T12:12:57.751Z",
      "end": "2026-09-12T12:12:57.751Z"
    },
    "scope": {
      "query": "Dentix (branded place detail)",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "profile_presence_in_sample",
    "unit": "count",
    "value": 1,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production"
  },
  "ai-mention-therapy": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "ai_mention",
    "source": {
      "kind": "ai_response",
      "id": "DENTIX-PR02-ai-mention-therapy"
    },
    "measured_at": "2026-09-12T11:58:36.297Z",
    "window": {
      "start": "2026-09-12T11:58:36.297Z",
      "end": "2026-09-12T11:58:36.297Z"
    },
    "scope": {
      "query": "стоматолог терапевт Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "dentix_mentions",
    "unit": "count",
    "value": 0,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production",
    "ai": {
      "platform": "Google Search AI Overview",
      "web_search": true,
      "prompt": "стоматолог терапевт Дніпро",
      "geography": "Ukraine / Dnipro query; IP locale Kyiv",
      "personalization": "pws=0; sign-in link visible; personalization UNKNOWN",
      "branded": false,
      "sample_size": 1,
      "rounds": 1,
      "links": [
        "https://www.google.com/goto?url=CAESTgHrOzAVTEkQy_oY0if779Njjk9RFAmVafuItCXIN9pTuyR52PXfU-L6Vg3mL0jIy5CDzweHrTYoUSJu7G_daaVjtSGXXr_5YaQLlag-ow"
      ]
    }
  },
  "ai-site-therapy": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "ai_site_citation",
    "source": {
      "kind": "ai_response",
      "id": "DENTIX-PR02-ai-site-therapy"
    },
    "measured_at": "2026-09-12T11:58:36.297Z",
    "window": {
      "start": "2026-09-12T11:58:36.297Z",
      "end": "2026-09-12T11:58:36.297Z"
    },
    "scope": {
      "query": "стоматолог терапевт Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "dentix_site_citations",
    "unit": "count",
    "value": 0,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production",
    "ai": {
      "platform": "Google Search AI Overview",
      "web_search": true,
      "prompt": "стоматолог терапевт Дніпро",
      "geography": "Ukraine / Dnipro query; IP locale Kyiv",
      "personalization": "pws=0; sign-in link visible; personalization UNKNOWN",
      "branded": false,
      "sample_size": 1,
      "rounds": 1,
      "links": [
        "https://www.google.com/goto?url=CAESTgHrOzAVTEkQy_oY0if779Njjk9RFAmVafuItCXIN9pTuyR52PXfU-L6Vg3mL0jIy5CDzweHrTYoUSJu7G_daaVjtSGXXr_5YaQLlag-ow"
      ]
    }
  },
  "ai-third-party-therapy": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "ai_third_party_citation",
    "source": {
      "kind": "ai_response",
      "id": "DENTIX-PR02-ai-third-party-therapy"
    },
    "measured_at": "2026-09-12T11:58:36.297Z",
    "window": {
      "start": "2026-09-12T11:58:36.297Z",
      "end": "2026-09-12T11:58:36.297Z"
    },
    "scope": {
      "query": "стоматолог терапевт Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "dentix_third_party_citations",
    "unit": "count",
    "value": 0,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production",
    "ai": {
      "platform": "Google Search AI Overview",
      "web_search": true,
      "prompt": "стоматолог терапевт Дніпро",
      "geography": "Ukraine / Dnipro query; IP locale Kyiv",
      "personalization": "pws=0; sign-in link visible; personalization UNKNOWN",
      "branded": false,
      "sample_size": 1,
      "rounds": 1,
      "links": [
        "https://www.google.com/goto?url=CAESTgHrOzAVTEkQy_oY0if779Njjk9RFAmVafuItCXIN9pTuyR52PXfU-L6Vg3mL0jIy5CDzweHrTYoUSJu7G_daaVjtSGXXr_5YaQLlag-ow"
      ]
    }
  }
}
```

## Checked claims

```json
[]
```

No claim establishes SEO causality, representative global visibility, or an actual client result from synthetic fixtures.


## Historical handoffs — superseded for the current PR05 action boundary

# DENTIX PR05 handoff — production readiness / Draft stage

PR04A/B/C merged to noindex preview only. PR #7 final head d4bc9bd20b1731b116d9d43ddf1c9447faffb884; merge/main 6465964edb7ae549f5abac9194fad9bbd18f2d9d; successful workflow 34759609171 / Pages deployment 6422001426 at same SHA; twelve live preview patient routes verified. PR05 local production-readiness controls and exact two requestedInterest seeds implemented; final validation/Draft publication receipts outside repository. No new service routes or medical copy. Hosting DECISION_PENDING_ACCESS; 64 migration rows unchanged, 49 HOLD preservation UNRESOLVED_CUTOVER_BLOCKER; KEEP 404 probe explicitly preserved. Review packet generated; professional review UNKNOWN / NOT_COMPLETED; no approved fallback surgeon/implantologist/orthopedist. WordPress remains production; React NOT_LAUNCHED. Candidate endpoints unset; booking disabled. GSC/GBP/GA4/GTM/Bing/CRM ACCESS_BLOCKED; call tracking UNKNOWN; T0 NOT_READY. Backups, host adapter, qualified sign-off and cutover authorization pending. outcome_report.claims=[]. Ready/merge/deploy/publish/accounts/indexing/release closure unauthorized.

Current stage authorization is `.seo/authorization.yml`. Release-state.yml records the last merged preview; live_smoke_passed=false and production_verified_at=null refer to production, which does not match React. project-state.yml is the pre-publication action-boundary snapshot; exact final PR/head/worktree receipts are external.

Run `scripts/release.py verify`, release tests and all existing browser suites. Final full validation receipts and release archive hash are in DENTIX_PR05_PRODUCTION_READINESS_EVIDENCE_2026-09-13. No fabricated counts or outcomes.

## Historical PR04C handoff (superseded by PR05 above)

# DENTIX PR04C final merge-stage handoff

Pre-merge action snapshot at 2026-09-13T13:07:45.718094+00:00, expires 2026-09-13T16:07:45.718094+00:00. User ZIP grants the exact PR04C Ready/normal merge/one automatic noindex preview stage; supersedes earlier Draft-only operational restrictions for this stage only. PR #7 OPEN/Draft/CLEAN; base ae1a929bd339b7a9172760320e9917325243004e; reviewed head 6da5ae7dffb7345de50aad6cdcd6b1782194a149; 43 changed paths; tracked/index clean at entry; two unrelated .DS_Store untouched. No overlapping PR; NO_SERVER_CI (empty checks is not CI PASS). Supplied remote review and independent local contract review PASS. Evidence ZIP 85955387 bytes; SHA-256 0436ecc37485c1182729b1578391318b2e17a1195908c11a852162b78b4bda33; 200/200 checksums; no undeclared payload. Seven source pins PASS; both exact legacy paths preserved; 12-route candidate; prices separate; Під ключ. note only. No approved fallback implantologist/orthopedist; exact managed-role and visible/Schema parity required; ортодонт negative. Professional review UNKNOWN / NOT_COMPLETED. Five-query bounded sanity sample dated 2026-09-13, device/searcher location/personalization UNKNOWN; no rank/volume finding. P2 requestedInterest decision/test required before public booking activation. Fresh exact-final-head suite, Ready, merge and one automatic deployment PENDING. Current verified preview remains PR #6 at ae1a929bd339b7a9172760320e9917325243004e, workflow 34755054592/deployment 6421117100. WordPress production; React NOT_LAUNCHED; GSC/GBP/GA4/GTM/Bing ACCESS_BLOCKED; T0 NOT_READY; outcome_report.claims=[].

Approved immutable operator 0.2.1: 213 matching files; exact ten skills; bundle, 47 negative/outcome tests and seven DENTIX path-scope cases PASS.

Seven-source pin details and price/clinician/content review are preserved in the original PR implementation records and external independent-contract-review.md. Current .seo records are pre-merge action snapshots. The older Draft-only statements in implementation records describe their original stage; the current authorization.yml controls only this bounded final stage. Release-state.yml remains the verified PR #6 preview snapshot until external final receipts establish PR #7 deployment; production release remains open.

Historical local QA: 25 unit; 34 artifact; two twelve-route builds; 120 hydrated + 120 no-JS + 240 semantic; 80 PR04C critical-region; 28 implant/prosthetics + 24 therapy + 30 surgery managed; 48 lead-source; 40 safe mobile; 16 founder/video. Fresh exact-final-head suite PENDING. Any fresh required failure stops before merge; no functional repair or rerun-until-green.

P2 PR-05-P2-REQUESTED-INTEREST: decide and test service/page context before future public booking activation; no source change in this mission.

After bounded metadata push: update only PR #7 body, Ready transition, one fresh isolated final-head suite, final remote/expiry gate, normal merge with branch retained, one automatic push/main Pages preview deployment and twelve-route live QA. No manual dispatch, production/cutover, external accounts, indexing or post-merge repository commit. Final receipts live in PR body and external sanitized evidence.

# Outcome report

Record validation only; no aggregate SEO PASS. Claims are bounded to their supplied evidence and explicit as_of date, not automatically current.

| Channel | Status | Evidence IDs |
|---|---|---|
| technical | UNKNOWN |  |
| google_indexation | ACCESS_BLOCKED |  |
| google_organic | OBSERVED | organic-brand, organic-kalynova |
| google_maps | OBSERVED | maps-brand |
| ai_mention | OBSERVED | ai-mention-therapy |
| ai_site_citation | OBSERVED | ai-site-therapy |
| ai_third_party_citation | OBSERVED | ai-third-party-therapy |
| ai_referral | ACCESS_BLOCKED |  |
| conversion_delivery | UNKNOWN |  |
| business_outcome | UNKNOWN |  |

## Record details

```json
{
  "technical": {
    "status": "UNKNOWN",
    "reason": "PR #6 merged ae1a929bd339b7a9172760320e9917325243004e; successful noindex preview workflow 34755054592 and deployment 6421117100 at the same SHA; ten live preview patient routes verified. Therapy and surgery merged to preview only. PR04C implantation/prosthetics implemented locally; fresh local QA PASS; one normal commit/push/Draft PR authorized. Both legacy URLs preserved. No approved fallback surgeon, implantologist or orthopedist. professional_review_status=UNKNOWN / NOT_COMPLETED; PROFESSIONAL_REVIEW_REQUIRED_BEFORE_PRODUCTION. Implantation and prosthetics-on-implants prices separate; Під ключ. remains source-row note only. WordPress remains production; React NOT_LAUNCHED; T0 NOT_READY; GSC/GBP/GA4/GTM/Bing ACCESS_BLOCKED; outcome_report.claims=[]. Ready/merge/deploy/publish/accounts/indexing/release closure unauthorized.",
    "evidence_ids": []
  },
  "google_indexation": {
    "status": "ACCESS_BLOCKED",
    "reason": "GSC URL Inspection unavailable; site search and SERP observations do not establish indexed URL inventory.",
    "evidence_ids": []
  },
  "google_organic": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "organic-brand",
      "organic-kalynova"
    ]
  },
  "google_maps": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "maps-brand"
    ]
  },
  "ai_mention": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "ai-mention-therapy"
    ]
  },
  "ai_site_citation": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "ai-site-therapy"
    ]
  },
  "ai_third_party_citation": {
    "status": "OBSERVED",
    "reason": "Bounded public research observation only; performance and achieved outcomes not established.",
    "evidence_ids": [
      "ai-third-party-therapy"
    ]
  },
  "ai_referral": {
    "status": "ACCESS_BLOCKED",
    "reason": "No authorized analytics referral dataset",
    "evidence_ids": []
  },
  "conversion_delivery": {
    "status": "UNKNOWN",
    "reason": "Intake lead/timed UNAVAILABLE in read-only status check; no receipt or connected-call evidence",
    "evidence_ids": []
  },
  "business_outcome": {
    "status": "UNKNOWN",
    "reason": "No real confirmed qualified-lead/booking/outcome aggregate evidence; no patient records accessed",
    "evidence_ids": []
  }
}
```

## Supplied observations (zero is a measured value)

```json
{
  "organic-brand": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "google_organic",
    "source": {
      "kind": "google_serp_sample",
      "id": "DENTIX-PR02-organic-brand"
    },
    "measured_at": "2026-09-12T12:03:32.550Z",
    "window": {
      "start": "2026-09-12T12:03:32.550Z",
      "end": "2026-09-12T12:03:32.550Z"
    },
    "scope": {
      "query": "DENTIX Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "site_presence_in_sample",
    "unit": "count",
    "value": 1,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production"
  },
  "organic-kalynova": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "google_organic",
    "source": {
      "kind": "google_serp_sample",
      "id": "DENTIX-PR02-organic-kalynova"
    },
    "measured_at": "2026-09-12T12:04:26.428Z",
    "window": {
      "start": "2026-09-12T12:04:26.428Z",
      "end": "2026-09-12T12:04:26.428Z"
    },
    "scope": {
      "query": "стоматологія Калинова Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "site_presence_in_sample",
    "unit": "count",
    "value": 1,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production"
  },
  "maps-brand": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "google_maps",
    "source": {
      "kind": "maps_sample",
      "id": "DENTIX-PR02-maps-brand"
    },
    "measured_at": "2026-09-12T12:12:57.751Z",
    "window": {
      "start": "2026-09-12T12:12:57.751Z",
      "end": "2026-09-12T12:12:57.751Z"
    },
    "scope": {
      "query": "Dentix (branded place detail)",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "profile_presence_in_sample",
    "unit": "count",
    "value": 1,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production"
  },
  "ai-mention-therapy": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "ai_mention",
    "source": {
      "kind": "ai_response",
      "id": "DENTIX-PR02-ai-mention-therapy"
    },
    "measured_at": "2026-09-12T11:58:36.297Z",
    "window": {
      "start": "2026-09-12T11:58:36.297Z",
      "end": "2026-09-12T11:58:36.297Z"
    },
    "scope": {
      "query": "стоматолог терапевт Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "dentix_mentions",
    "unit": "count",
    "value": 0,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production",
    "ai": {
      "platform": "Google Search AI Overview",
      "web_search": true,
      "prompt": "стоматолог терапевт Дніпро",
      "geography": "Ukraine / Dnipro query; IP locale Kyiv",
      "personalization": "pws=0; sign-in link visible; personalization UNKNOWN",
      "branded": false,
      "sample_size": 1,
      "rounds": 1,
      "links": [
        "https://www.google.com/goto?url=CAESTgHrOzAVTEkQy_oY0if779Njjk9RFAmVafuItCXIN9pTuyR52PXfU-L6Vg3mL0jIy5CDzweHrTYoUSJu7G_daaVjtSGXXr_5YaQLlag-ow"
      ]
    }
  },
  "ai-site-therapy": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "ai_site_citation",
    "source": {
      "kind": "ai_response",
      "id": "DENTIX-PR02-ai-site-therapy"
    },
    "measured_at": "2026-09-12T11:58:36.297Z",
    "window": {
      "start": "2026-09-12T11:58:36.297Z",
      "end": "2026-09-12T11:58:36.297Z"
    },
    "scope": {
      "query": "стоматолог терапевт Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "dentix_site_citations",
    "unit": "count",
    "value": 0,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production",
    "ai": {
      "platform": "Google Search AI Overview",
      "web_search": true,
      "prompt": "стоматолог терапевт Дніпро",
      "geography": "Ukraine / Dnipro query; IP locale Kyiv",
      "personalization": "pws=0; sign-in link visible; personalization UNKNOWN",
      "branded": false,
      "sample_size": 1,
      "rounds": 1,
      "links": [
        "https://www.google.com/goto?url=CAESTgHrOzAVTEkQy_oY0if779Njjk9RFAmVafuItCXIN9pTuyR52PXfU-L6Vg3mL0jIy5CDzweHrTYoUSJu7G_daaVjtSGXXr_5YaQLlag-ow"
      ]
    }
  },
  "ai-third-party-therapy": {
    "project_id": "dentix",
    "repository": "optidigitalagent/dentix-booking-demo",
    "production_url": "https://dentix.ua/",
    "urls": [
      "https://dentix.ua/"
    ],
    "channel": "ai_third_party_citation",
    "source": {
      "kind": "ai_response",
      "id": "DENTIX-PR02-ai-third-party-therapy"
    },
    "measured_at": "2026-09-12T11:58:36.297Z",
    "window": {
      "start": "2026-09-12T11:58:36.297Z",
      "end": "2026-09-12T11:58:36.297Z"
    },
    "scope": {
      "query": "стоматолог терапевт Дніпро",
      "filters": "hl=uk;gl=ua;pws=0;first visible page; no numeric ranking",
      "market": "Ukraine / Dnipro query; IP locale Kyiv",
      "language": "uk",
      "device": "desktop Chrome"
    },
    "metric": "dentix_third_party_citations",
    "unit": "count",
    "value": 0,
    "denominator": null,
    "event_type": "research_sample",
    "synthetic": false,
    "limitations": "Single public snapshot for legacy dentix.ua; not new React launch, stable rank, performance baseline, growth, referral or business outcome. Research details in serp-sample.csv/maps-sample.csv/ai-sample-log.csv.",
    "environment": "production",
    "ai": {
      "platform": "Google Search AI Overview",
      "web_search": true,
      "prompt": "стоматолог терапевт Дніпро",
      "geography": "Ukraine / Dnipro query; IP locale Kyiv",
      "personalization": "pws=0; sign-in link visible; personalization UNKNOWN",
      "branded": false,
      "sample_size": 1,
      "rounds": 1,
      "links": [
        "https://www.google.com/goto?url=CAESTgHrOzAVTEkQy_oY0if779Njjk9RFAmVafuItCXIN9pTuyR52PXfU-L6Vg3mL0jIy5CDzweHrTYoUSJu7G_daaVjtSGXXr_5YaQLlag-ow"
      ]
    }
  }
}
```

## Checked claims

```json
[]
```

No claim establishes SEO causality, representative global visibility, or an actual client result from synthetic fixtures.

PR05 acceptance 2026-09-13T15:10:35.113651+00:00: required suite PASS. Actual counts {"npm_test": 25, "artifact_tests": 34, "hydrated": 120, "no_javascript": 120, "semantic": 240, "http_404": 4, "lead_source": 48, "release_routes": 48, "booking_seeds": 16, "release_tests": 13, "therapy_managed": 24, "surgery_managed": 30, "implant_managed": 28, "implant_critical_browser": 80, "founder_video": 16, "safe_mobile": 40}. Production content SHA-256 2accd43447e1592c9a422030370a377229882e198291c04ce3142999ec75e669. Final commit/normal-push/Draft PR and candidate ZIP receipts remain external. No medical review or SEO/business achievement.

## PR06 persistent-login continuation — 2026-09-28

Manual SMS/2FA handoff and fresh Playwright-context session resume PASS for the active DENTIX hosting service. Three prepared panel backups passed size, gzip and SHA-256 checks in protected private local storage; no archive contents entered Git or evidence. An isolated random staging subdomain has a separate root and valid HTTPS certificate; staging Nginx static bypass is off. The exact verified production-disabled candidate and 60-file Basic Auth/noindex overlay were uploaded through the panel file manager. Remote HTTPS checks PASS: 401/200 authentication, 12 GET and HEAD routes, 404, staging-only 301/410, noindex, robots, media Range, release marker, 58 public file hashes, no open proxy and no redirect loop. FTPS was not used and the FTP allowlist was not changed. The dedicated backup-manager control was not found; file-manager download was used. The local 64-row migration replay remains PASS with 49 HOLD rows unresolved. Production is NOT_LAUNCHED, credential rotation P0, outcome claims empty, and Draft PR #9 remains Draft.

## PR06 final-review merge gate — 2026-09-29T06:08:36Z
2026-09-29 2026-09-29T06:08:36Z — PR06 final independent review PASS for Draft PR #9: base 9fddc64020fcdcf0e01020be838be72c75b1d4a8, reviewed head efd203ff4cc6364e3553bea30e6f9cc7f4105c4a, 32 operational files, zero patient-facing source changes. Evidence ZIP SHA-256 9382dce15e366b955c5ab82400b35353093760290c2e44cf1aa984f2a3185967, 1,922 bytes, four JSON members. Three private backups verified; isolated Mirohost staging read-only smoke PASS (12 GET/HEAD, 401/200, 404/301/410, noindex, Range, 58 hashes). Authorization expires 2026-09-29T09:08:36Z; Ready, normal merge and one automatic noindex Pages preview pending. All 49 HOLD unresolved; credential rotation P0; old WordPress production NOT_LAUNCHED; outcome_report.claims=[].
