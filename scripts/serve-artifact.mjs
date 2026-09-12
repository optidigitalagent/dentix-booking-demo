import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { getBuildProfile } from "../src/build-profile.ts";

export async function serveArtifact(target, port = 0) {
  const profile = getBuildProfile(target);
  const root = path.resolve(profile.outDir);
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
  const server = http.createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); res.end(); return; }
    let file;
    let status = 200;
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (!pathname.startsWith(profile.base)) throw new Error("Outside base");
      const relative = pathname.slice(profile.base.length);
      if (relative.split("/").some((part) => part.startsWith(".")) || relative.includes("\\")) throw new Error("Private path");
      file = path.resolve(root, relative || "index.html");
      if (!file.startsWith(root + path.sep)) throw new Error("Outside artifact");
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          const requestUrl = new URL(req.url, "http://localhost");
          res.writeHead(308, { Location: requestUrl.pathname + "/" + requestUrl.search });
          res.end(); return;
        }
        file = path.join(file, "index.html");
      }
      if (!(await stat(file)).isFile()) throw new Error("Missing file");
      if (file === path.join(root, "404.html")) status = 404;
    } catch { file = path.join(root, "404.html"); status = 404; }
    try {
      const body = await readFile(file);
      res.writeHead(status, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch { res.writeHead(500); res.end("Build the artifact first."); }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); });
  return { server, origin: `http://127.0.0.1:${server.address().port}`, base: profile.base };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { origin, base } = await serveArtifact(process.argv[2], Number(process.argv[3] ?? 4181));
  console.log(`Local artifact: ${origin}${base}`);
}
