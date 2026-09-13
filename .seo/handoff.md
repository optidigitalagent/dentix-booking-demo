# DENTIX PR04B merge/preview pre-action handoff

PR #6 remains OPEN/Draft at review: base `be42e9d3547a9388e2e0a0ffa4d7258a55616579`, implementation head `c2c36d966f747092e9a20447f656227b90e11c7e`, exactly 42 changed paths. Current authorization runs 2026-09-13T11:28:14.102250+00:00 through 2026-09-13T14:28:14.102250+00:00; see authorization.yml for the exact matrix. Ready, normal merge, exactly one automatic push/main noindex Pages preview deployment and ten-route live QA are pending. External action is limited to PR #6 body updates. Final exact-head validation and action receipts belong to external DENTIX_PR04B_MERGE_PREVIEW_DEPLOY_EVIDENCE_2026-09-13; this committed record is a pre-merge snapshot, with no post-merge commit.

Remote review PASS; local evidence integrity PASS: 75,502,477 bytes, SHA-256 `2f4c8017b624c205710286f97759f0297413a2bd2d3803f98a33ff6ce42e2195`, all 184 declared entries verified. Independent source/content/no-surgeon review PASS; all seven implementation-start blob pins verified, approved site/doctors/prices/About/media protected, services.ts link/label change only. No critical/high finding. GitHub records NO_SERVER_CI, never a CI pass.

Routes: /khirurhichna-stomatolohiia/, /vydalennia-zuba/, /vydalennia-zuba-mudrosti/; exactly ten patient routes. Complex extraction remains /vydalennia-zuba/#complex-extraction; no PR04C. Shared managed price source and exact row selectors exclude implantation. Approved fallback has no exact visible хірург role: zero named surgery cards/Person, phone guidance. Future exact managed surgeon role uses visible/Schema parity. Professional review UNKNOWN / NOT_COMPLETED; named-surgeon and expanded clinical production claims remain blocked.

Historical implementation QA: 20 unit, both ten-route builds, 28 artifact tests, 100 hydrated + 100 no-JS + 200 semantic, 30 surgery + 24 therapy managed, 40 lead-source, 40 safe mobile, 16 founder/video cases PASS. These are archived results; one fresh suite on the final pre-merge head is still required. Bounded four-query sanity evidence from 2026-09-13 supports retained architecture only; device/searcher location/personalization UNKNOWN; no rank or volume evidence.

Current preview still serves PR04A at `be42e9d3547a9388e2e0a0ffa4d7258a55616579` (workflow 34752031347; deployment 6420548670). release-state.yml describes that previous preview; it does not close a production release. dentix.ua remains the old WordPress site; React NOT_LAUNCHED. GSC/GBP/GA4/GTM/Bing ACCESS_BLOCKED, T0 NOT_READY, 49 migration HOLD dispositions retained. No production, account, indexing, submission, appointment, later PR or release-closure authority. outcome_report.claims=[]; the unchanged renderer below describes supplied records and observations only.

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
    "reason": "PR04A merged be42e9d3547a9388e2e0a0ffa4d7258a55616579 to seven-route noindex preview; workflow 34752031347/deployment 6420548670 verified. PR04B ten-route local implementation validated; Draft stage only. Old WordPress remains production; React NOT_LAUNCHED; production readiness NOT_ESTABLISHED.",
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
