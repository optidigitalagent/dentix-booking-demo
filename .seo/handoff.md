# DENTIX PR03 handoff

PR03 adds /likari/ and /kontakty/, links all four patient routes, and adds a shared production-only entity graph derived from approved current sources. Existing layout, four doctors, contact details, prices, founder/video, runtime managed content and fail-closed intake remain intact. Person nodes appear only on pages displaying the team; supporting PostalAddress/OpeningHoursSpecification/ListItem objects carry approved values. No invented clinical, credential, review or legal claims.

DENTIX_ENTITY_FACT_LOCK_V1 is recorded in canonical facts-register.csv, entity-consistency.csv and data-source-register.yml. The four pinned source blobs remain unchanged. Legacy WordPress/profile differences do not override the new-source fact lock. PR04 and external profiles remain outside this stage.

Post-PR02 reconciliation: PR #3 merged at 160804ce2fd0cd759788f2ec2961b1638f7dcda8; successful noindex preview run 34695414098. Production is still old WordPress; React NOT_LAUNCHED. Migration map remains 64 rows / 49 HOLD. GSC/GBP/GA4/GTM/Bing ACCESS_BLOCKED; numeric T0 NOT_READY.

Fresh validation: 10 unit tests, both builds, 14 artifact tests, 40 hydrated and 40 no-JS Chromium route/viewport cases, 16 managed-content/lead-source cases, 40 safe Chromium/WebKit mobile cases, 16 founder/video cases; all PASS. Five widths: 360, 390, 768, 1024, 1440. No POST or appointment. Preview noindex/no canonical/no sitemap/no entity graph. Production artifact has four self-canonicals and four sitemap URLs; production admin and unknown paths return 404. Package and lockfile unchanged. Maps/fonts intercepted in browser lab; no field CWV, live endpoint validation or search/business result claimed.

This is the pre-commit snapshot. Final commit, push and Draft PR receipt are in the external evidence pack, avoiding a self-referential follow-up commit. One normal commit/push/Draft PR authorized; next action is review of that Draft PR. Ready/merge/deploy/production/accounts/indexing/release closure are unauthorized. Evidence directory: ~/Downloads/DENTIX_PR03_ENTITY_LOCAL_EVIDENCE_2026-09-12/. outcome_report.claims=[].

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
    "reason": "PR01 preview reconciled and noindex observed; old WordPress remains production. New React production readiness NOT_ESTABLISHED.",
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
