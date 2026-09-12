import { build } from "vite";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getBuildProfile } from "../src/build-profile.ts";
import { postbuild } from "./postbuild.mjs";

if (process.argv.length !== 3) throw new Error("Usage: build.mjs preview|production");
const profile = getBuildProfile(process.argv[2]);
process.env.DENTIX_BUILD_TARGET = profile.target;
await build({ mode: profile.target });
const manifest = JSON.parse(await readFile(`${profile.outDir}/.vite/manifest.json`, "utf8"));
const serverDir = path.resolve(profile.outDir, ".prerender");
// Fixed under this profile's ignored build output, never an arbitrary input path.
try {
  await build({
    mode: profile.target,
    publicDir: false,
    plugins: [{
      name: "prerender-client-asset-parity",
      enforce: "pre",
      load(id) {
        const relative = path.relative(process.cwd(), id).replaceAll("\\", "/");
        if (/\.(?:png|jpe?g|webp|svg|ico)$/.test(relative) && manifest[relative]) {
          return `export default ${JSON.stringify(profile.base + manifest[relative].file)};`;
        }
      },
    }],
    build: {
      ssr: "src/entry-server.tsx",
      outDir: serverDir,
      manifest: false,
      rollupOptions: { input: "src/entry-server.tsx", output: { entryFileNames: "entry-server.mjs" } },
    },
  });
  const { render } = await import(pathToFileURL(path.join(serverDir, "entry-server.mjs")));
  await postbuild(profile, render);
} finally {
  if (!serverDir.startsWith(path.resolve(profile.outDir) + path.sep)) throw new Error("Unsafe temporary build path");
  await rm(serverDir, { recursive: true, force: true });
}
