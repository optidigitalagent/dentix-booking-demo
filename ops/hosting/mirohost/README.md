# DENTIX Mirohost adapter

Scope: `dentix.ua` only. These files are local templates, not a production deployment. The current live WordPress root must stay untouched.

`render_adapter.py` reads the committed 64-row migration contract and emits a `.htaccess` into a new directory outside this repository. It rejects tenant/count drift and emits exact-path 503 blockers for all 49 HOLD rows and WordPress functional query aliases. This is intentional fail-closed behavior; none of those rows is counted as preserved. The single 410 remains a commented template until owner retirement and link checks. Five sitemap redirects remain closed at 503 unless `--sitemap-ready` is explicitly selected after the replacement sitemap has passed. The two other 301 rows are the HTTP and www apex normalization policy. Ten directory routes gain slash normalization; `/` and `/price.html` do not.

The production template assumes a trusted nginx front end conveys the external scheme through `X-Forwarded-Proto: https`, or Apache receives `HTTPS=on`. This is **unverified on Mirohost**. Public-edge GET and HEAD tests must prove no redirect loop and exact 301/404/410 behavior before it can be used. The generated file must never be copied over the live WordPress `.htaccess` in PR-06.

The staging template requires an absolute auth-user-file path outside the document root, Basic Auth over TLS, and sends `X-Robots-Tag: noindex, nofollow, noarchive`. Use a random credential and bcrypt `htpasswd` for any remote staging deployment; the test fixture's temporary hash is only for localhost replay. `prepare_staging.py` validates the release ZIP against its manifest and creates a *separate* local copy with twelve meta noindex markers, a disallow-all robots file, and a source SHA marker. The original release ZIP stays byte-identical. A remote upload is allowed only after the Mirohost panel proves an isolated staging document root that does not modify the production WordPress root. Never put a password in a URL or the repository.

## HOLD preservation decision

1. Prefer same-account legacy WordPress under a separate, isolated document root/subdirectory only if the hosting owner can version and roll back it. Rewrite each of the 49 exact source paths to a verified legacy handler; preserve method, path and query; include media, feeds, attachments and functional query aliases. No catch-all proxy and no foreign-host target.
2. Exact static preservation is acceptable only if each page, dependency, status and content fingerprint is snapshotted and replayed.
3. Owner-approved row decisions can replace preservation for individual rows after evidence and migration-contract updates.
4. A front layer such as a Cloudflare Worker is only a future alternative if the current host cannot meet the contract. It is not selected or deployed here.

The selected strategy is **pending live access and 49-row replay**. Until then, the generated adapter blocks HOLD paths with 503 rather than incorrectly serving the new homepage or a generic 404. Production cutover remains blocked.

## Rollback template

Before any future cutover, keep a versioned copy of the old document root, database and pre-cutover routing in owner-controlled encrypted storage. Record their hashes and restore procedure privately. A future authorized rollback restores the previous vhost/document-root mapping and exact old `.htaccess`, then verifies the twelve main paths, representative HOLD paths, robots/sitemap, mail and WordPress admin by GET/HEAD. PR-06 does not perform a restore or modify production.
