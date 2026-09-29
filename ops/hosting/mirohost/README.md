# DENTIX Mirohost adapter, PR-07

The adapter is scoped to SITE_ID DENTIX. `render_adapter.py` validates the committed 99-row final migration/direct-object contract and 58-case query-alias manifest. It renders `.htaccess` **outside Git** for either the existing isolated staging root or a later separately authorized production release. It has no proxy fallback. Exact static HTML, RSS/XML and media resolve from the external preservation package; unknown WordPress functional selectors return 410.

Render staging only with the existing absolute auth-user-file path. Staging enforces Basic Auth, `X-Robots-Tag: noindex, nofollow, noarchive`, no-store and source SHA. `prepare_pr07_staging.py` combines the verified React release and external 81-file preservation ZIP into a new local noindex overlay. Its output must be uploaded only to the proven separate staging document root. `automation/verify_pr07_staging.py` reads the private review credential from Keychain and checks 12 patient routes, 99 migration rows, 58 aliases, all public file hashes, media Range and fail-closed behavior. It never submits forms.

Production rendering remains gated. Five legacy WordPress sitemap redirects return 503 in the default production adapter until a separately authorized cutover validates the replacement sitemap. The alternative `--sitemap-ready` rendering is only an offline QA candidate. Do not install either production adapter on live WordPress during PR-07.

The production front end must convey a trustworthy HTTPS signal through Apache `HTTPS=on` or `X-Forwarded-Proto`. Recheck this at the public edge during a separately authorized launch. The previous WordPress root and database remain the rollback target. Credential rotation is P0 before any cutover; PR-07 does not rotate credentials.

The panel manual-login helper leaves its private persistent Chromium profile under the DENTIX application support directory. If Mirohost keeps the session valid, that profile may avoid another SMS challenge; the hosting provider controls session expiry. Never copy browser state, credentials or the private staging address into Git or evidence.
