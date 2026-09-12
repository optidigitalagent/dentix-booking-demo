import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { getBuildProfile } from "../src/build-profile.ts";
import { priceBlocks } from "../src/data/prices.ts";
import { services } from "../src/data/services.ts";
import { serveArtifact } from "../scripts/serve-artifact.mjs";

const read = (target, name) => fs.readFileSync(`dist/${target}/${name}`, "utf8");
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => tag);
const attr = (tag, name) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
const meta = (html, key) => tags(html, "meta").filter((tag) => attr(tag, "name") === key || attr(tag, "property") === key).map((tag) => attr(tag, "content"));
const canonicals = (html) => tags(html, "link").filter((tag) => attr(tag, "rel") === "canonical").map((tag) => attr(tag, "href"));
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const plain = (html) => decode(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
const results = {};
const record = (group, row) => (results[group] ??= []).push(row);

for (const target of ["preview", "production"]) {
  const profile = getBuildProfile(target);
  const production = target === "production";
  for (const file of ["index.html", "price.html"]) {
    test(`${target} ${file}: initial HTML, route head, schema and source parity`, () => {
      const html = read(target, file), text = plain(html);
      const url = profile.origin + profile.base + (file === "index.html" ? "" : file);
      assert.match(html, /<html lang="uk"/);
      assert.equal(tags(html, "h1").length, 1);
      // Removing tags must not invent whitespace: adjacent spans need a real separator.
      const h1 = decode(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
      if (file === "index.html") assert.equal(h1, "Стоматологія DENTIX");
      const outline = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({ level: Number(m[1]), text: decode(m[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim() }));
      for (let i = 1; i < outline.length; i++) assert.ok(outline[i].level <= outline[i - 1].level + 1, `${target} ${file}: heading skip ${JSON.stringify(outline.slice(i - 1, i + 1))}`);
      if (file === "index.html") {
        assert.deepEqual(outline[1], { level: 2, text: "Інформація для відвідувачів" });
        assert.match(html, /<section class="trust" aria-labelledby="clinic-info-heading"><h2 class="sr-only" id="clinic-info-heading">/);
      }
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length, "duplicate IDs");
      const leadForms = tags(html, "form").filter((tag) => attr(tag, "class") === "lead-form");
      assert.equal(leadForms.length, 1, "ContactSection is the initial lead entry; drawer mounts on open");
      assert.deepEqual(leadForms.map((tag) => attr(tag, "data-source-site")), [target === "preview" ? "PUBLIC_DEMO" : "CANONICAL_CANDIDATE"]);
      record("h1_assertions", { target, file, stage: "initial_html", normalized_text: h1, exact_home_match: file === "index.html" ? true : null, pass: true });
      record("heading_outline_assertions", { target, file, stage: "initial_html", outline, duplicate_ids: [], pass: true });
      record("lead_source_initial_assertions", { target, file, entry: "ContactSection", stage: "initial_html", source_site: attr(leadForms[0], "data-source-site"), pass: true });
      assert.match(html, /id="root" data-prerendered="true"><[^>]+/);
      assert.ok(text.length > 1000);
      assert.match(text, /DENTIX/);
      assert.match(text, /Дніпр/);
      assert.match(html, /href="tel:\+380679854050"/);
      assert.deepEqual(meta(html, "robots"), [production ? "index,follow" : "noindex,nofollow,noarchive"]);
      assert.deepEqual(canonicals(html), production ? [url] : []);
      assert.equal(tags(html, "title").length, 1);
      assert.equal(meta(html, "description").length, 1);
      assert.deepEqual(meta(html, "og:url"), [url]);
      assert.deepEqual(meta(html, "og:locale"), ["uk_UA"]);
      assert.deepEqual(meta(html, "twitter:card"), ["summary_large_image"]);
      assert.equal(meta(html, "og:title").length, 1);
      assert.equal(meta(html, "og:description").length, 1);
      assert.deepEqual(meta(html, "og:image"), [profile.origin + profile.base + "dentix-og-social.png"]);
      assert.ok(fs.existsSync(path.join(profile.outDir, "dentix-og-social.png")));
      if (production) assert.doesNotMatch(html.match(/<head>([\s\S]+)<\/head>/)[1], /noindex|client demo|онлайн-запис/i);
      const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
      assert.equal(ld.length, production ? 1 : 0);
      if (production) {
        assert.equal(ld[0]["@context"], "https://schema.org");
        assert.deepEqual(ld[0]["@graph"].map((entry) => entry["@type"]), ["WebSite", "WebPage"]);
        assert.equal(ld[0]["@graph"][1].url, url);
        for (const entry of ld[0]["@graph"]) assert.equal(entry.inLanguage, "uk");
        assert.doesNotMatch(JSON.stringify(ld), /AggregateRating|Review|SearchAction|Offer|Dentist|LocalBusiness|Person/);
      }
      if (file === "price.html") {
        for (const block of priceBlocks) {
          assert.ok(html.includes(`id="${block.id}"`));
          for (const row of block.rows) {
            assert.ok(text.includes(row.name), row.name);
            assert.ok(text.includes(row.cost), row.cost);
          }
        }
      } else for (const service of services) assert.ok(text.includes(service.title), service.title);
      for (const button of tags(html, "button").filter((tag) => attr(tag, "type") === "submit")) assert.match(button, /disabled/);
      record("html_head_assertions", { target, file, url, title: html.match(/<title>(.*?)<\/title>/)[1], description: meta(html, "description")[0], canonical: canonicals(html), robots: meta(html, "robots"), pass: true });
      record("initial_html_assertions", { target, file, h1_count: 1, text_length: text.length, fallback_source_parity: true, phone_cta: true, pass: true });
      record("structured_data_assertions", { target, file, blocks: ld, pass: true });
    });
  }
  test(`${target}: every initial internal link, fragment and asset resolves`, () => {
    for (const file of ["index.html", "price.html", "404.html"]) {
      const html = read(target, file);
      const current = new URL(profile.base + (file === "index.html" ? "" : file), profile.origin);
      let checked = 0;
      for (const tag of [...tags(html, "a"), ...tags(html, "img"), ...tags(html, "script"), ...tags(html, "link")]) {
        const value = attr(tag, "href") ?? attr(tag, "src");
        if (!value) continue;
        const url = new URL(decode(value), current);
        if (url.origin !== profile.origin) continue;
        assert.ok(url.pathname.startsWith(profile.base), `${file}: wrong base ${url}`);
        const relative = url.pathname.slice(profile.base.length) || "index.html";
        const local = path.join(profile.outDir, relative);
        assert.ok(fs.existsSync(local), `${file}: missing ${value}`);
        if (url.hash) assert.ok(fs.readFileSync(local, "utf8").includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing fragment ${value}`);
        checked++;
      }
      record("internal_link_assertions", { target, file, checked, pass: true });
    }
  });
  test(`${target}: index policies, genuine 404 and admin isolation`, async () => {
    const html = read(target, "404.html");
    assert.match(html, /Сторінку не знайдено/);
    assert.deepEqual(meta(html, "robots"), ["noindex,nofollow,noarchive"]);
    assert.deepEqual(canonicals(html), []);
    assert.equal(tags(html, "script").length, 0);
    assert.equal(tags(html, "h1").length, 1);
    assert.ok(html.includes(`href="${profile.base}"`));
    const robots = read(target, "robots.txt");
    assert.match(robots, /User-agent: \*\nAllow: \/\n/);
    assert.doesNotMatch(robots, /Disallow:\s*\//);
    assert.equal(fs.existsSync(`${profile.outDir}/CNAME`), false);
    assert.equal(fs.existsSync(`${profile.outDir}/.prerender`), false);
    const manifest = JSON.parse(read(target, ".vite/manifest.json"));
    const adminEntries = Object.keys(manifest).filter((key) => /admin/i.test(key));
    assert.equal(adminEntries.length > 0, !production);
    if (production) {
      assert.equal(fs.existsSync(`${profile.outDir}/admin`), false);
      const code = fs.readdirSync(`${profile.outDir}/assets`).filter((file) => /\.(js|css)$/.test(file)).map((file) => read(target, `assets/${file}`)).join("\n");
      assert.doesNotMatch(code, /AdminCrm|admin-shell|admin-sidebar|DEMO Пацієнт|DEMO Dentist|\/admin\//);
      const sitemap = read(target, "sitemap.xml");
      assert.match(sitemap, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
      assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]), ["https://dentix.ua/", "https://dentix.ua/price.html"]);
      assert.doesNotMatch(sitemap, /lastmod|admin|github|404/);
      assert.equal((robots.match(/Sitemap:/g) ?? []).length, 1);
      assert.match(robots, /Sitemap: https:\/\/dentix.ua\/sitemap.xml/);
    } else {
      assert.equal(fs.existsSync(`${profile.outDir}/sitemap.xml`), false);
      assert.doesNotMatch(robots, /Sitemap:/);
      assert.deepEqual(meta(read(target, "admin/index.html"), "robots"), ["noindex,nofollow,noarchive"]);
      assert.deepEqual(canonicals(read(target, "admin/index.html")), []);
    }
    const { server, origin, base } = await serveArtifact(target);
    try {
      for (const suffix of ["", "price.html"]) assert.equal((await fetch(origin + base + suffix)).status, 200);
      for (const suffix of ["missing-pr01", "404.html", ...(production ? ["admin/", "admin/index.html"] : [])]) {
        const response = await fetch(origin + base + suffix);
        assert.equal(response.status, 404);
        assert.equal(await response.text(), html);
      }
    } finally { await new Promise((resolve) => server.close(resolve)); }
    record("admin_isolation_assertions", { target, admin_entries: adminEntries, admin_artifact: !production, http_missing_status: 404, pass: true });
    record("robots_sitemap_assertions", { target, robots, sitemap_urls: production ? ["https://dentix.ua/", "https://dentix.ua/price.html"] : [], pass: true });
  });
}

test.after(() => {
  if (process.env.DENTIX_QA_OUTPUT) {
    fs.mkdirSync(process.env.DENTIX_QA_OUTPUT, { recursive: true });
    for (const [group, rows] of Object.entries(results)) fs.writeFileSync(path.join(process.env.DENTIX_QA_OUTPUT, `${group}.json`), JSON.stringify({ observed_at: new Date().toISOString(), rows }, null, 2) + "\n");
  }
});
