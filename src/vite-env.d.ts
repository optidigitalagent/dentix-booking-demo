/// <reference types="vite/client" />

declare const __DENTIX_LEAD_SOURCE__: "PUBLIC_DEMO" | "CANONICAL_CANDIDATE";

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
