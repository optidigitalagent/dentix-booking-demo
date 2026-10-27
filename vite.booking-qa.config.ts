import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Separate authenticated build of the SAME BookingDrawer; public build is unchanged.
export default defineConfig({
  base: "/booking-qa/", envDir: false, publicDir: false,
  define: {
    __DENTIX_LEAD_SOURCE__: JSON.stringify("CANONICAL_CANDIDATE"),
    "import.meta.env.VITE_DENTIX_BOOKING_QA": JSON.stringify("true"),
    "import.meta.env.VITE_DENTIX_BOOKING_ENABLED": JSON.stringify("true"),
    "import.meta.env.VITE_DENTIX_BOOKING_API_URL": JSON.stringify("/api/public/booking"),
  },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [react()],
  build: { outDir: "dist/booking-qa", manifest: true, rollupOptions: { input: "booking-qa.html" } },
});
