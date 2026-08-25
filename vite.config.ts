import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];

  return {
    base: process.env.GITHUB_ACTIONS && repository ? `/${repository}/` : "/",
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [react()],
  };
});
