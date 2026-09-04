/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DENTIX_CONTENT_API_URL?: string;
  readonly VITE_DENTIX_CONTENT_TIMEOUT_MS?: string;
  readonly VITE_DENTIX_LEADS_API_URL?: string;
  readonly VITE_DENTIX_LEAD_TEST_MODE?: string;
  readonly VITE_DENTIX_PRIVACY_POLICY_URL?: string;
  readonly VITE_DENTIX_LEAD_CONTACT_METHODS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
