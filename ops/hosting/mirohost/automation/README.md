# DENTIX private Mirohost runner

`runner.py` is scoped to SITE_ID DENTIX and the existing PR-06 work. It reads
the two access files from `~/Downloads/DENTIX_PRIVATE_ACCESS` at runtime. Set
`PLAYWRIGHT_MODULE_PATH` to the absolute path of an installed Playwright ESM
entrypoint, then run `python3 runner.py PHASE [--dry-run]`. Its Chromium profile
is created inside a private temporary state directory and removed when the
process exits. Receipts remain outside Git in that directory; set
`--state-dir` to reuse a private 0700 directory.

The phase names are `panel-audit`, `ensure-ftp-ip`, `download-backups`,
`create-staging`, `upload-candidate`, `verify-staging`,
`cleanup-temporary-access`, and `all`. The backup phase supports one protected
FTPS session, remote size checks, atomic file replacement, gzip integrity,
SHA-256 receipts, and FileVault protected storage. It fails closed when
FileVault is off; an encrypted container must be implemented and verified
before that branch can run.

The original credential based panel phases remain fail closed for writes until
their controls are verified. Use the manual login handoff for account access.
Never point any upload or server rule at the production WordPress root.

For the two-phase manual login, run `manual-login-start` with
`PLAYWRIGHT_MODULE_PATH` set. It starts a detached headed Chromium window at
`https://control.mirohost.net/` and returns after the window loads. It never
reads stored credentials. `manual-login-status` reports one of
`WAITING_FOR_USER`, `AUTHENTICATED`, `EXPIRED`, or `ERROR`; it does not print
browser state. After authentication, the helper closes only its own window
and retains private browser state under
`~/Library/Application Support/DENTIX/MirohostPR06`. `resume-after-login`
opens that saved state in a separate Playwright context and checks the DENTIX
service UI. Run `manual-login-clear` at mission completion to stop
the helper and remove that entire private session directory. These commands
are idempotent for an active session and cleanup; an expired or failed session
must be cleared before starting again.

The staging upload was completed through the authenticated panel file manager
after confirming its separate document root. The Basic Auth user file was
installed outside that root, then `.htaccess` was installed and an HTTPS 401
without credentials was verified before any page files were uploaded.
`verify_staging.py` performs read-only HTTPS checks with the Keychain-stored
review credential and compares the 58 public overlay files by SHA-256. The
FTP allowlist was not changed.
