import { copyFile, mkdir, writeFile } from "node:fs/promises";

await mkdir(new URL("../dist/admin/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../dist/index.html", import.meta.url),
  new URL("../dist/admin/index.html", import.meta.url),
);
await copyFile(
  new URL("../dist/index.html", import.meta.url),
  new URL("../dist/404.html", import.meta.url),
);
await writeFile(new URL("../dist/.nojekyll", import.meta.url), "", "utf8");
