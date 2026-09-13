// Local build only. A release candidate never inherits enabled preview endpoints.
import { spawnSync } from 'node:child_process';
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('VITE_') && !key.startsWith('DENTIX_')));
Object.assign(env, { VITE_DENTIX_BOOKING_ENABLED: 'false', VITE_DENTIX_CONTENT_TIMEOUT_MS: '4000', VITE_DENTIX_LEAD_CONTACT_METHODS: 'PHONE,TELEGRAM,VIBER,WHATSAPP' });
const result = spawnSync('npm', ['run', 'build:production'], { env, stdio: 'inherit' });
process.exitCode = result.status ?? 1;
