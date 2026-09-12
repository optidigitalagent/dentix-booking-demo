# DENTIX PR02 handoff

SITE_ID DENTIX; repository optidigitalagent/dentix-booking-demo; branch seo/dentix-pr02-migration-demand-baseline; base ff675a1e4363d1c5e8d936b5273710bf5db89211. This is the pre-commit planning snapshot; final commit/push/Draft PR receipt and ZIP hashes are recorded in the external evidence pack and final report. No self-referential commit SHA is invented.

PR #2 is merged and successful noindex Pages preview deployment matches current main. Old WordPress dentix.ua remains production. New React NOT_LAUNCHED; no release closure. Prior Ready/merge/deploy grant is superseded for PR02; current authorization permits one planning commit/push/Draft PR only.

Review redirect-map.csv and crawl-report.csv: 61 discovered old URLs plus 3 explicit probes = 64 rows; 9 discovered HTML pages, 38 media URLs, 7 feeds and 7 controls. Recommendations include exact-URL rebuilds for home, implantation, prosthetics and microscope. HOLD rows are cutover blockers, not missing dispositions. Production/log/GSC-only orphan coverage remains unknown.

Review serp-sample.csv (20 observed queries, four retained unsampled RU seeds), maps-sample.csv (13 observations across local packs, panels and Maps detail), ai-sample-log.csv (three fully reviewed Google AI Overviews; other provider gaps). Samples are localized desktop observations, not stable ranks. See research-methodology.md for IP, source and completeness limits. Competitor evidence is third-party research, not DENTIX facts or medical advice.

Review content-inventory.csv (12 exact page decisions), query-page-map.csv, bounded briefs and execution-plan.md. Sequence PR03 entity/doctor/local/price; PR04A therapy/caries/consolidated canals-microscope; PR04B surgery/extraction/wisdom; PR04C implantation plus legacy prosthetics preservation. All require later implementation authorization and approved first-party facts/clinical reviewers.

Measurement: access-matrix.csv, data-source-register.yml, utm-taxonomy.csv + utm-rules.md, event-dictionary.yml and measurement-plan.yml. GSC blocked by connector subscription; GA4/GTM/GBP/Bing data blocked, hosting public read-only, CRM/calls unknown. Numeric T0 NOT_READY. Phone clicks and client submits are intent only. No private records read or events sent.

Cutover remains blocked by HOLD decisions, unapproved target hosting/301/410 capability, missing replacement pages, owned facts/prices/clinical/asset evidence and baseline/access/QA/rollback prerequisites. Do not Ready, merge, deploy, change accounts, submit sitemap/indexing or start pages from this handoff. Next action: review this Draft PR; future steps need separately bounded authority.

outcome_report.claims=[]; the schema-backed RECORD renderer output follows after validation. Record validity is not SEO/GEO or lead success.

## Validation and record

Client schemas, commit-state gate, operator bundle/skills validation, 170 trigger cases, 10 scenarios, 47 outcome-gate tests and 21 Python tests passed. The page-map validator expects one row per URL, so it validates the 12-row content-inventory.csv; query-page-map.csv retains the canonical one-row-per-query design and is checked separately for complete mapping. No source/build changes were made. Historical technical observations remain dated; PR02 reconciliation is authoritative for the current preview.

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
