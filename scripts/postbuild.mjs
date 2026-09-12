import { readFile, writeFile, mkdir } from "node:fs/promises";
import { getBuildProfile } from "../src/build-profile.ts";

import { routeMetadata } from "../src/page-metadata.ts";
export { routeMetadata };

const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function pageHead(target, route) {
  const profile = getBuildProfile(target);
  const metadata = routeMetadata[route];
  if (!metadata) throw new Error(`Unknown metadata route: ${route}`);
  const production = target === "production";
  const title = production ? metadata.title : `${metadata.title} — попередній перегляд`;
  const description = production ? metadata.description : `Попередній перегляд сайту DENTIX. ${metadata.description}`;
  const url = profile.origin + profile.base + metadata.path;
  const socialImage = profile.origin + profile.base + "dentix-og-social.png";
  return `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />
    <meta name="robots" content="${production ? "index,follow" : "noindex,nofollow,noarchive"}" />
    ${production ? `<link rel="canonical" href="${url}" />` : ""}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${socialImage}" />
    <meta property="og:locale" content="uk_UA" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
    <meta name="twitter:image" content="${socialImage}" />
    <link rel="icon" href="${profile.base}favicon.ico" />
    <noscript><style>.reveal-up{opacity:1;transform:none;filter:none}</style></noscript>`;
}

export function notFoundHtml(target) {
  const { base } = getBuildProfile(target);
  return `<!doctype html>
<html lang="uk"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex,nofollow,noarchive" /><title>Сторінку не знайдено — DENTIX</title>
<style>body{margin:0;background:#122721;color:#fff;font:1.1rem/1.6 system-ui,sans-serif}main{max-width:42rem;margin:12vh auto;padding:2rem}p{color:#ced9d4}h1{font-size:clamp(2rem,7vw,3.5rem);line-height:1.15}a{color:#fff;text-underline-offset:.3em}a:focus-visible{outline:3px solid #d8c58a;outline-offset:6px}</style></head>
<body><main><p>DENTIX · 404</p><h1>Сторінку не знайдено</h1><p>Перевірте адресу або поверніться на головну сторінку.</p><a href="${base}">На головну DENTIX</a></main></body></html>\n`;
}

export async function postbuild(profile, render) {
  getBuildProfile(profile.target);
  const shell = await readFile(`${profile.outDir}/index.html`, "utf8");
  // Keep Vite's built asset tags; generate route policy in one place.
  const assets = [...shell.matchAll(/<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>|<link\b[^>]*\brel="(?:stylesheet|modulepreload)"[^>]*>/g)].map(([tag]) => tag).join("\n    ");
  if (!assets.includes('type="module"')) throw new Error("Missing patient entry in Vite output");
  for (const route of Object.keys(routeMetadata)) {
    const body = render(route);
    if (!body.includes("<h1")) throw new Error(`Empty prerender: ${route}`);
    const html = `<!doctype html>\n<html lang="uk"><head>${pageHead(profile.target, route)}\n    ${assets}</head><body data-demo-surface="patient"><div id="root" data-prerendered="true">${body}</div></body></html>\n`;
    const routePath = routeMetadata[route].path;
    if (routePath.endsWith("/")) await mkdir(`${profile.outDir}/${routePath}`, { recursive: true });
    await writeFile(`${profile.outDir}/${routePath === "" || routePath.endsWith("/") ? routePath + "index.html" : routePath}`, html);
  }
  await writeFile(`${profile.outDir}/404.html`, notFoundHtml(profile.target));
  await writeFile(`${profile.outDir}/.nojekyll`, "");
  // Permit fetching preview HTML so its noindex is observable; this does not
  // control the shared GitHub Pages host's root robots policy.
  await writeFile(`${profile.outDir}/robots.txt`, `User-agent: *\nAllow: /\n${profile.target === "production" ? "\nSitemap: https://dentix.ua/sitemap.xml\n" : ""}`);
  if (profile.target === "production") {
    await writeFile(`${profile.outDir}/sitemap.xml`, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://dentix.ua/</loc></url><url><loc>https://dentix.ua/likari/</loc></url><url><loc>https://dentix.ua/kontakty/</loc></url><url><loc>https://dentix.ua/price.html</loc></url></urlset>\n');
  }
  console.log(`DENTIX ${profile.target}: home/doctors/contacts/price prerendered; 404 generated; output ${profile.outDir}`);
}
