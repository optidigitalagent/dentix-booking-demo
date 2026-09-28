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

The initial live panel login did not establish an authenticated session.
Panel mutations, isolated-root creation, upload, and remote QA consequently
return explicit blockers. These phase interfaces cannot be treated as proof
of staging. Never point this runner at the production WordPress root.
