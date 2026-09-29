# P0 credential rotation plan

The private access material contains credentials. Rotate after panel access, backup receipts and staging validation, and before any separately authorized production cutover. Do not place new credentials or rotation receipts with secret values in Git.

1. Inventory active users, service dependencies and recovery methods in the registrar and Mirohost panels. Confirm control of the owner mailbox and a second administrator before changing either panel credential.
2. Rotate the registrar/domain account and Mirohost control-panel credentials; verify login and DNS/hosting visibility without changing zone records.
3. Rotate WordPress administrators one at a time, preserving at least one verified administrator and checking editor, plugin and backup workflows.
4. Rotate FTP accounts individually; update only the approved deployment/backup clients and confirm read-only listing and a safe staging upload. Keep production transfers paused until verified.
5. Rotate every MySQL user with a coordinated WordPress configuration update and tested rollback; preserve grants, confirm production pages/admin and database connectivity, then revoke the old password.
6. Rotate Elementor/account credentials and verify licensing and existing page rendering without publishing changes.
7. Rotate every affected mailbox credential one at a time. Check SMTP/IMAP clients, WordPress mail transport, inbound/outbound delivery and DNS mail records without changing DNS in this mission.
8. Invalidate old sessions/tokens where supported, use MFA and owner-controlled password storage, and record only redacted timestamps/statuses. Recheck live WordPress, forms and mail before any cutover decision.

No credential is rotated by PR-06.
