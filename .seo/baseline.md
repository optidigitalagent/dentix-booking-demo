> Current-state reconciliation (2026-09-12): PR #2 merged; successful noindex Pages preview matches main ff675a1e4363d1c5e8d936b5273710bf5db89211. Old dentix.ua WordPress remains production; React NOT_LAUNCHED. PR02 research and page decisions are in execution-plan.md, research-methodology.md and canonical CSVs. Earlier observations below remain dated history, not current PR/preview status.

# DENTIX T0 baseline
Captured 2026-09-08T11:33:58Z; technical observations at 11:28–11:30 UTC on 2026-09-08. Scope: optidigitalagent/dentix-booking-demo @ f8431478b995031131fcdf4c12d89afdb6743067; GitHub Pages is preview, https://dentix.ua/ is the old website and future domain.

## Source and publication
Git default branch is main. Starting local main was 12714766413ed671f437836b9465daa5e9c5dae0 (7 commits behind); fetched origin/main matches the mission snapshot. Branch seo/dentix-pr00-bootstrap-t0 starts at origin/main. The existing local main ref was not advanced. No open PRs or recently merged PRs were returned. Only remote main was present.
GitHub deployment 6324604734 reports success at 2026-09-08T09:26:45Z with preview URL https://optidigitalagent.github.io/dentix-booking-demo/ and SHA f8431478b995031131fcdf4c12d89afdb6743067; Actions run 34209979816 succeeded. The legacy Pages builds endpoint returned 404; deployment/status and Actions are the available SHA evidence. No new deployment was performed.
The typed project-state deployed_sha is null because it describes target production, not preview. production_matches_deploy and external_state_verified remain false; this is not proof of an outage. worktree_clean is false only because the proposed .seo files are untracked. handoff_matches_remote describes this new PR00 handoff; the old README conflict remains recorded.

## Rechecked hypotheses
| Hypothesis | T0 result and evidence | Scope/limit |
|---|---|---|
| Preview noindex | CONFIRMED: index.html and both public GETs/DOM contain noindex,nofollow,noarchive | Intentional preview policy; retain |
| Demo metadata | CONFIRMED: initial title/description and home runtime title are demo-oriented | Price runtime title is specific; initial price HTML is shared |
| Canonical absent | CONFIRMED: none in source or both preview DOM samples | Old https://dentix.ua/ has a self-canonical; do not conflate |
| robots/sitemap absent | CONFIRMED: no source/build files; preview GETs each HTTP 404 | Returned body is the shared app shell |
| JSON-LD absent | CONFIRMED: no source or preview DOM blocks | No production eligibility/result asserted |
| Critical initial HTML absent | CONFIRMED: empty root; no initial H1; DOM renders one H1 on each sampled page | Source-only and rendered counts are different |
| Missing #parodontologiya target | CONFIRMED: src/data/services.ts link; absent from src/data/prices.ts and rendered price block IDs | Current 390x844 DOM sample |
| Public admin artifact | CONFIRMED: main.tsx imports/routes AdminCrm; postbuild emits dist/admin/index.html | Admin UI/private data not inspected |
| Forms unavailable | CONFIRMED narrowly: public intake-status GET has lead/timed disabled and UNAVAILABLE with no policy URL; both page submit buttons disabled | No form opened/submitted, no delivery test; available tel links do not prove connected calls |
| Same-domain replacement | CONFIRMED by tenant lock; old production is still WordPress | Availability of old site does not prove new launch |

Source/build references: index.html; src/main.tsx; scripts/postbuild.mjs; vite.config.ts; src/data/services.ts; src/data/prices.ts; src/lib/intake-status.ts; src/components/LeadForm.tsx; src/components/booking/BookingDrawer.tsx; .github/workflows/deploy-pages.yml. All source observations refer to f8431478b995031131fcdf4c12d89afdb6743067.
Build validation: npm ci, npm test and npm run build passed in an isolated git-archive copy at C:\Users\Admin\AppData\Local\Temp\dentix-pr00-build-xsxjq37x; all 118 copied tracked source files remained byte-identical. .env files were excluded. Pages base was reproduced; private runtime variable values were not accessed. Built 404.html and price.html equal index.html; /admin/ is emitted. Source lock SHA256: 199911c39f5fa6f7ba73c88d824d7226c5bf554e6816eaaf874ce1fa14c3faf6.
Rendered sample: Chromium 390x844; home and price HTTP 200, Ukrainian, one H1 each, no page exceptions observed. Images/media were blocked; this was DOM QA, not five-viewport visual/accessibility/performance testing. No writes were attempted. Full QA belongs to PR-01/06.
Sanitized detailed observations and body hashes are in technical-baseline.json and the external review ZIP (public_url_evidence.json, rendered_dom_evidence.json, build_verification.json and command logs).

## Facts and migration constraints
The old [DENTIX website](https://dentix.ua/) currently presents free consultation, while src/data/prices.ts at this SHA records a 2026-09-07 snapshot with consultation 500 грн and says runtime public content is primary. This is a conflict requiring owner resolution; neither value is selected for new publication.
The old home links /implantatsiya/, /lechenie-pod-mikroskopom/ and /protezirovanie/. These are discovery seeds only, not a full crawl, destination approval or redirect map. Status/depth/value/backlink history of those URLs is RESEARCH_REQUIRED in PR-02.
The source names 11 unclassified clinical image imports and 10 certificate display images; they are file counts, not cases, outcomes, licenses or doctor credentials. Selected review cards do not establish an aggregate rating. No clinical pixels, review identities, patient records or private data are copied to .seo or the ZIP; no consent is inferred from a source path.
Prior README integration claims are stale: current workflow/code supports runtime content/booking configuration and fail-closed readiness. Configuration presence does not prove real public conversion delivery.

## T0 outcomes and access
measurement-baseline.csv records each of 17 stages independently: implementation, preview publication, new production launch, old production availability, indexation, Google organic, Maps, AI mention, own-site citation, AI referral, visit, intent, delivery, connected interaction, qualified lead, appointment and completed visit/revenue.
New production launch is NOT_YET. Google indexation/organic and Maps are ACCESS_BLOCKED; AI samples UNKNOWN; referrals/traffic ACCESS_BLOCKED; delivered conversion, connection, qualified lead, appointments and revenue UNKNOWN. No missing dataset is numeric zero. No completed calls are inferred from tel links.
GSC, GBP, GA4/GTM and Bing data/property access are not supplied for this mission. No private account inspection, connection changes or analytics configuration occurred. Future work needs explicitly authorized scoped aggregate exports, named data owners, dates/timezone/filters/device, qualification definitions and comparison windows.
No achieved outcome claims are declared. The required operator renderer must return RECORD with independent UNKNOWN/ACCESS_BLOCKED channels; it cannot establish VERIFIED or success.

## Interpretation and review
1. Preserve preview index control and implement the production foundation in a separately authorized PR-01; test domain/profile and source/DOM parity.
2. Preserve old URL value through a separately authorized PR-02 inventory and reviewed dispositions; verify actual HTTP behavior before/after launch.
3. Approve clinic facts and conversion/measurement definitions before later public content and outcome work; absence of comparable evidence remains a data gap.
Reviews at 0–7/28/90 days after launch are decision windows, not promises.

Current guidance read 2026-09-08: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features) says normal fundamentals apply and no special AI file/schema is required; serving is not guaranteed. [Google site: limitations](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site) does not support treating an absent sample as proof of non-indexation. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) separates search discovery from training controls. No crawler policy was changed.
