/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DENTIX_CONTENT_API_URL?: string;
  readonly VITE_DENTIX_CONTENT_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
