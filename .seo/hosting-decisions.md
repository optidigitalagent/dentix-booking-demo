# DENTIX hosting and cutover register

2026-09-12, same-domain replacement. No hosting/DNS changes authorized or made.

| Decision | Evidence / state | Owner / prerequisite |
|---|---|---|
| Current platform | Public HTTP `server: nginx`, WP REST links, WP sitemap and WordPress-generated HTML; old WordPress still serves dentix.ua. | Hosting owner must identify origin/account/configuration. |
| DNS | Public A 89.184.75.186; NS ns1/ns2/ns3.mirohost.net. These identify observed routing/delegation, not a proven hosting contract. | DNS account access and zone export ACCESS_BLOCKED. |
| New production host | UNKNOWN / not approved. GitHub Pages is the current noindex preview only. | Owner selects existing nginx/static origin or another host with tested response rules. |
| Redirects | Existing sitemap.xml 302 to wp-sitemap.xml; host/protocol chains captured separately. Arbitrary custom 301/410 edit capability UNKNOWN. | Hosting owner demonstrates staging rules, exact host/path/query behavior and rollback. |
| GitHub Pages alone | Static files/custom domain/custom 404 are documented. No configurable arbitrary per-path server 301/410 capability is evidenced. Inference: Pages alone is not accepted for this migration map; an approved redirect-capable edge/origin or revised preservation plan is required. | Never substitute JS/meta-refresh or universal homepage rewrite for HTTP redirects. |
| Custom 404 | Pages supports 404.html; PR01 created real not-found content. Production status/template behavior still must be tested on selected host. | Genuine HTTP 404; no SPA success shell at missing URL. |
| HTTPS / www | Current primary canonical uses https://dentix.ua/; Maps links to www. Host/protocol variants captured in crawl evidence. | TLS for apex/www, one-hop canonical rules where practicable, no loop; preserve unrelated services/MX. |
| Legacy media/reviews/feeds | HOLD rows need owner disposition/provenance; old assets cannot silently vanish. | Inventory media variants and private comment export without placing personal data in repository. |

Required sequence: resolve every HOLD or approve a tested preservation mechanism; create all replacement pages (including prosthetics); approve facts/prices/clinical copy; choose host; prepare full WordPress/database/uploads and configuration backup with owner-controlled retention; record DNS zone/TTL, origin and TLS; test every map row and internal link on noindex staging; confirm canonical/sitemap/robots parity and old verification files/tags; capture quantitative T0/consent/tracking ownership; agree monitoring and rollback owner; obtain explicit deployment/DNS/indexing authorization. No automatic cutover date.

Before switch, approve URL and media coverage, redirects and real errors, test the phone route and separately authorized delivery QA, exclude preview/admin/test data, preserve existing verification. No broad homepage redirects; serve exact rebuilt service URLs. Parameter cases (WordPress IDs, tracking) require host/log/export evidence and tests before launch; current public crawl cannot enumerate private-log-only aliases.

Rollback plan must be rehearsed on chosen host: retain previous origin/build/database/uploads and exact DNS/config state; name operator and recovery window; revert on widespread 5xx/TLS errors, commercial URL loss, accidental noindex/wrong canonical or confirmed intake failure. Diagnose data latency before claiming traffic regression. At 0–7 days check routing daily; 28/90-day reviews require compatible baseline/outcome data. Redirect longevity policy should follow current Google guidance and observed residual access, with at least one year planned for moved URLs where applicable; never remove solely at an arbitrary launch milestone.

Sources checked 2026-09-12: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [custom 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site), [Google URL moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). These document capabilities/guidance; they do not prove account configuration.
