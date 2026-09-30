# PR-08 Phase A GO/NO-GO and rollback matrix

Updated 2026-09-30T09:07:49Z. Source main `0cc446e0a525b419f9a79be963ff469eef25210b`. Production remains old WordPress. No production document-root mutation or DNS/indexing action is allowed in Phase A.

| Gate | GO evidence | Current status |
|---|---|---|
| Delegated hosting access | Separate technical user opens H-158422 and dentix.ua without owner recovery changes | PASS: service and site visible |
| Credential rotation | Recovery verified, each active exposed secret replaced in owner-controlled storage, fresh login and dependent WordPress/database/mail access proved | NO-GO: FTP rotation user-confirmed and old SFTP attempt rejected; replacement secret absent from accessible Keychain, independent verification and other active rotations open |
| Fresh backups | Post-rotation full files and DB, verified sizes, gzip and SHA-256 in encrypted private storage | PARTIAL: fresh SQL ZIP verified in private FileVault storage; post-rotation files archive missing |
| Cold restore | Isolated Basic-Auth/noindex WordPress plus cloned DB, admin/media/legacy paths verified | PARTIAL: local SQL clone imported 23 WordPress tables over temporary UNIX socket; server WordPress restore not run |
| Atomic rollback rehearsal | Same-filesystem rehearsal without live root change, measured recovery ≤900 seconds | NO-GO: not run |
| DNS/TLS/mail | Full zone/TTL/NS/MX/TXT/CAA export and TLS renewal path verified, zero mutations | PARTIAL: six panel zone records and active TLS inspected; registrar export and automatic renewal proof pending |
| Candidate | Exact merged-main source, deterministic 12-route production HTML, 99 rows, 58 aliases, 81 preserved files, phone-first fail-closed | LOCAL PASS |
| Private staging | Existing Basic Auth/noindex root updated to exact candidate; 12/99/58, all file hashes and 70 Range checks | NO-GO: exact-main 141-file overlay locally verified; remote upload and 12/99/58 replay not run |
| Consent and migration | Three excluded objects stay exact 410; zero HOLD; no new patient fact or claim | PASS_LOCAL |
| Release decision | Named owners, all gates PASS, exact same-chat `DENTIX_PRODUCTION_GO` | NOT RECEIVED |

Release owner: Artem Antonov. Hosting and rollback operator: current authorized DENTIX operator session. Business/contact owner: DENTIX clinic owner. Measurement owner: Artem Antonov until delegated.

Delegated panel inventory on 2026-09-30: one FTP login with a two-host allowlist; one MySQL database and one localhost user, matching the saved WordPress configuration; no local mailboxes or forwarding. The private supplied material contains panel, FTP, MySQL, WordPress and Elementor credential references. Only the FTP and MySQL accounts are confirmed active in the tenant; WordPress/Elementor credential validity and owner recovery remain unverified. No secret value is recorded here. The DNS panel shows TTL 3600 and six records: MX, SPF TXT, apex/www A, and two existing private-staging A records. Production and private-staging Let's Encrypt certificates are installed and in use; the production certificate was issued 2026-09-15 and expires 2026-12-13T22:56:21Z. Automatic renewal is not yet evidenced. The hosting mail panel reports SMTP blocked, DKIM disabled and zero mailboxes. No DNS, TLS or mail setting was changed.

The pre-existing merged-main release ZIP was reused without a rebuild. Its isolated noindex staging overlay was prepared outside Git with source SHA `0cc446e0a525b419f9a79be963ff469eef25210b`, 81 preserved files and 141 total overlay files. At 2026-09-30T09:07:49Z, the user-supplied fresh SQL ZIP passed exact archive and stream SHA-256, size, CRC and single-entry checks and was moved to FileVault-protected private storage. A temporary local UNIX-socket MariaDB import passed with 23 WordPress tables and three critical option names; the instance and datadir were removed. The exact-main 141-file staging overlay was verified locally, including 81 preserved files. FTP replacement-secret retrieval, fresh files backup, server WordPress restore/rollback and remote replay remain open. No production, DNS or indexing action occurred.

After a separate exact GO, recheck no-drift and fresh backup, freeze WordPress writes, upload versioned release sibling, validate privately, rename live WordPress root to protected rollback sibling, rename verified release into the established root, then synchronously verify 12 routes, 99 rows, 58 aliases, sitemap before five gated redirects, robots/canonical/Schema, exact 404/410, media hashes/Range, contacts, fail-closed forms, TLS/mail and 30-minute stabilization. A P0 route/status/hash, TLS/redirect loop, indexability, privacy/admin exposure, contact, form activation or critical 5xx regression triggers immediate reverse renames, old WordPress verification and no retry in the same authorization. Preserve old WordPress root and DB until a separate retention decision.

---

# DENTIX PR-07 production GO and rollback runbook

Status: **candidate only**. The live WordPress root, DNS, analytics, integrations and indexing have not been changed. A separate owner GO and exact cutover authorization are required before any production mutation.

## Candidate identity and controls

- `migration-contract.json`: 99 executable source rows (64 original plus 35 direct objects), zero unresolved dispositions. The 49 former HOLD paths resolve to four static HTML, seven static RSS/XML and 38 original exact media paths. The remaining original rows cover six rebuilt 200 URLs, seven exact 301s, one 404 and one 410; the 35 added direct objects add 32 exact preserves and three exact 410s.
- `hold-decisions.json` records each former HOLD path, current public fingerprint, completed 28-day request aggregate, replacement decision and rollback rule. The 90-day log window is unavailable; GSC remains `ACCESS_BLOCKED`, backlink index `UNKNOWN`.
- `preservation-manifest.json` is a sanitized file and hash contract. The actual public legacy bytes and private receipt live in the external preservation ZIP, never Git.
- `query-aliases.json` defines 58 known WordPress selector cases. Unknown functional selectors return 410; they never reach the React homepage.
- The rendered production adapter is an **external artifact**. The five WordPress sitemap redirects remain gated until the new sitemap is live and independently validated. The only intended host is HTTPS apex; unrelated paths return a real 404. The corrected private staging replacement has a 0755 root/directories, 0644 public files and zero world-writable paths; the disabled unsafe old root is outside the active document root.
- Three consent-sensitive direct paths are excluded from the candidate and return exact 410. Their exclusion does not block this candidate; any later republication requires a separate documented consent decision.
- React launch mode stays phone first. Booking is disabled and lead/booking/content endpoints remain empty. No real form or appointment test is authorized.

## Pre-cutover GO checklist (separate future authorization)

1. Name the launch, hosting, clinical and rollback owners, freeze source, confirm exact source SHA, production artifact, preservation ZIP, 99-row contract, query manifest and external SHA-256 receipts. Reject any mismatch.
2. Reconfirm the verified private WordPress files/SQL backup receipts, backup age, complete DNS zone and old root routing. Rehearse old-origin restoration in isolation and record actual recovery time; this rehearsal remains a P0 cutover gate. Preserve original WordPress root and database before switching any document root.
3. Keep the three excluded consent-sensitive direct objects at exact 410. A newly identified consent conflict in any included object is a NO-GO until the owner supplies a documented resolution; do not add patient imagery from the backup merely because it is technically public.
4. Rotate exposed hosting/FTP/database credentials under a separately authorized owner procedure. This remains P0 and is not executed by PR-07.
5. Rebuild the exact release from merged main under separate authorization. The accepted PR-07 private staging replay passed 12 patient routes, 99 rows, 58 aliases, 139 hashes and 70 Range checks; the future rebuilt release must repeat the required checks, including HTTPS/www behavior, no open proxy, no loops, custom 404, exact 410 and rollback. Staging must retain Basic Auth, X-Robots-Tag noindex and robots disallow.
6. Decide whether any real lead endpoint is approved and tested. Otherwise retain phone-first, disabled booking and no form delivery. Do not invent an endpoint.
7. Validate production sitemap contents and canonical routes before enabling five legacy sitemap 301s. Do not submit sitemap or request indexing without separate authorization.
8. Record a concrete production GO with exact mutation window, owners and rollback trigger. PR-07 review, merge and preview tests do not grant GO.

## Cutover (not authorized by PR-07)

1. Put only the verified public React artifact and exact-path preservation bytes in a versioned new release directory. Keep WordPress intact as the rollback target. Install the reviewed adapter in the selected root only within the GO window.
2. Verify live GET/HEAD for 12 patient routes, 99 migration rows and all known aliases. Confirm canonical/index policy, XML and media MIME types, Range, release marker, 404/410, HTTPS/www query preservation, no generic homepage fallback and no loops.
3. Activate the five sitemap redirects only after `/sitemap.xml` is 200 with the approved canonical set. No sitemap submission or indexing request follows automatically.
4. Preserve before/after HTTP receipts and observe errors, calls and leads without placing patient data in public evidence.

## Rollback (future authorized launch owner)

Trigger rollback on route or asset corruption, TLS/host loop, 5xx regression, wrong index/canonical directives, exposed admin surface, unapproved intake activation, or any of the 49 preserved paths returning a generic homepage or wrong status. Freeze writes, restore the old WordPress document-root and routing snapshot atomically, then verify the original critical pages, media, robots/sitemaps, query aliases, TLS and mail DNS. Do not restore database bytes over newer records without a reviewed recovery plan. Record recovery duration and incident cause; retry only after fresh QA and authorization.

`outcome_report.claims=[]`: technical release preparation is not evidence of rankings, leads or revenue.
