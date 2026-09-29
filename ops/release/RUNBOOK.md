# DENTIX PR-07 production GO and rollback runbook

Status: **candidate only**. The live WordPress root, DNS, analytics, integrations and indexing have not been changed. A separate owner GO and exact cutover authorization are required before any production mutation.

## Candidate identity and controls

- `migration-contract.json`: 64 original source rows, zero unresolved dispositions. The 49 former HOLD paths resolve to four static HTML, seven static RSS/XML and 38 exact media paths. The other rows cover six rebuilt 200 URLs, seven exact 301s, one 404 and one 410.
- `hold-decisions.json` records each former HOLD path, current public fingerprint, completed 28-day request aggregate, replacement decision and rollback rule. The 90-day log window is unavailable; GSC remains `ACCESS_BLOCKED`, backlink index `UNKNOWN`.
- `preservation-manifest.json` is a sanitized file and hash contract. The actual public legacy bytes and private receipt live in the external preservation ZIP, never Git.
- `query-aliases.json` defines 58 known WordPress selector cases. Unknown functional selectors return 410; they never reach the React homepage.
- The rendered production adapter is an **external artifact**. The five WordPress sitemap redirects remain gated until the new sitemap is live and independently validated. The only intended host is HTTPS apex; unrelated paths return a real 404.
- React launch mode stays phone first. Booking is disabled and lead/booking/content endpoints remain empty. No real form or appointment test is authorized.

## Pre-cutover GO checklist (separate future authorization)

1. Name the launch, hosting, clinical and rollback owners, freeze source, confirm exact source SHA, production artifact, preservation ZIP, 64-row contract, query manifest and external SHA-256 receipts. Reject any mismatch.
2. Verify the encrypted WordPress files/SQL backups, backup age, complete DNS zone and old root routing. Rehearse old-origin restoration in isolation and record actual recovery time. Preserve original WordPress root and database before switching any document root.
3. Review public legacy media provenance. A newly identified patient/consent conflict is a NO-GO until the owner supplies a documented resolution; do not add patient imagery from the backup merely because it is technically public.
4. Rotate exposed hosting/FTP/database credentials under a separately authorized owner procedure. This remains P0 and is not executed by PR-07.
5. Rebuild exact release from the reviewed commit. Verify 12 patient routes, preservation manifest bytes, query aliases, HTTPS/www behavior, Range, no open proxy, no loops, custom 404, exact 410 and rollback in isolated staging. Staging must retain Basic Auth, X-Robots-Tag noindex and robots disallow.
6. Decide whether any real lead endpoint is approved and tested. Otherwise retain phone-first, disabled booking and no form delivery. Do not invent an endpoint.
7. Validate production sitemap contents and canonical routes before enabling five legacy sitemap 301s. Do not submit sitemap or request indexing without separate authorization.
8. Record a concrete production GO with exact mutation window, owners and rollback trigger. PR-07 Draft status and tests alone do not grant GO.

## Cutover (not authorized by PR-07)

1. Put only the verified public React artifact and exact-path preservation bytes in a versioned new release directory. Keep WordPress intact as the rollback target. Install the reviewed adapter in the selected root only within the GO window.
2. Verify live GET/HEAD for 12 patient routes, 64 migration rows and all known aliases. Confirm canonical/index policy, XML and media MIME types, Range, release marker, 404/410, HTTPS/www query preservation, no generic homepage fallback and no loops.
3. Activate the five sitemap redirects only after `/sitemap.xml` is 200 with the approved canonical set. No sitemap submission or indexing request follows automatically.
4. Preserve before/after HTTP receipts and observe errors, calls and leads without placing patient data in public evidence.

## Rollback (future authorized launch owner)

Trigger rollback on route or asset corruption, TLS/host loop, 5xx regression, wrong index/canonical directives, exposed admin surface, unapproved intake activation, or any of the 49 preserved paths returning a generic homepage or wrong status. Freeze writes, restore the old WordPress document-root and routing snapshot atomically, then verify the original critical pages, media, robots/sitemaps, query aliases, TLS and mail DNS. Do not restore database bytes over newer records without a reviewed recovery plan. Record recovery duration and incident cause; retry only after fresh QA and authorization.

`outcome_report.claims=[]`: technical release preparation is not evidence of rankings, leads or revenue.
