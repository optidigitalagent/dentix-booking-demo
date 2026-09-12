import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { getBuildProfile } from "./src/build-profile.ts";

export default defineConfig(() => {
  const profile = getBuildProfile(process.env.DENTIX_BUILD_TARGET ?? "preview");

  return {
    base: profile.base,
    // The same validated profile supplies both client and prerender builds.
    define: { __DENTIX_LEAD_SOURCE__: JSON.stringify(profile.leadSource) },
    // Builds use explicit public VITE_* process settings; do not read local .env files.
    envDir: false as const,
    build: {
      outDir: profile.outDir,
      manifest: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          patient: fileURLToPath(new URL("./index.html", import.meta.url)),
          ...(profile.target === "preview" ? { admin: fileURLToPath(new URL("./admin/index.html", import.meta.url)) } : {}),
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [react()],
  };
});
