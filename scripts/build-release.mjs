// Production connects to the existing API. Server privacy/resource gates control intake.
import { spawnSync } from 'node:child_process';
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('VITE_') && !key.startsWith('DENTIX_')));
Object.assign(env, {
  VITE_DENTIX_BOOKING_ENABLED: 'true',
  VITE_DENTIX_BOOKING_API_URL: 'https://dentix-app-production.up.railway.app/api/public/booking',
  VITE_DENTIX_LEADS_API_URL: 'https://dentix-app-production.up.railway.app/api/public/leads',
  VITE_DENTIX_CONTENT_API_URL: 'https://dentix-app-production.up.railway.app/api/public/content',
  VITE_DENTIX_CONTENT_TIMEOUT_MS: '4000',
  VITE_DENTIX_LEAD_CONTACT_METHODS: 'PHONE,TELEGRAM,VIBER,WHATSAPP',
});
const result = spawnSync('npm', ['run', 'build:production'], { env, stdio: 'inherit' });
process.exitCode = result.status ?? 1;
