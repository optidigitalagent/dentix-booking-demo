import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { surgeryPages, selectSurgeryDoctors, selectSurgeryPrices, type SurgeryRoute } from "../src/data/surgery-pages.ts";
import { priceBlocks } from "../src/data/prices.ts";
import { buildEntitySchema } from "../src/lib/entity-schema.ts";

const source = fs.readFileSync("src/data/site.ts", "utf8");
const clinic = Object.fromEntries([...source.matchAll(/^  (\w+): "([^"]*)",/gm)].map((match) => [match[1], match[2]]));
clinic.logo = "/assets/logo.png";
const doctor = (id: string, role: string) => ({ id, role, name: `Fixture ${id}`, photo: "/assets/doctor.webp", alt: "", objectPosition: "center" });
const approvedRoles = [...fs.readFileSync("src/data/doctors.ts", "utf8").matchAll(/role: "([^"]+)"/g)].map((match, i) => doctor(String(i), match[1]));

test("approved fallback has no surgeon; only the exact visible surgeon role token matches", () => {
  assert.equal(approvedRoles.length, 4);
  assert.deepEqual(selectSurgeryDoctors(approvedRoles), []);
  const team = [doctor("a", "Лікар-хірург"), doctor("b", "стоматолог, хірург"), doctor("c", "нейрохірург"), doctor("d", "помічник хірурга"), doctor("e", "хірургія"), doctor("f", "хірург")];
  assert.deepEqual(selectSurgeryDoctors(team).map(({ id }) => id), ["a", "b", "f"]);
  assert.deepEqual(selectSurgeryDoctors([]), []);
});

test("surgery uses exact shared managed rows without implantation or removed-row backfill", () => {
  const costs = new Map([
    ["Консультація стоматолога", "500 грн"],
    ["Прицільний рентген", "Входить у вартість консультації"],
    ["Видалення зуба", "від 1 000 грн"],
    ["Видалення зуба мудрості", "від 2 000 грн"],
    ["Складне видалення ретинованого зуба", "від 4 000 грн"],
  ]);
  for (const route of Object.keys(surgeryPages) as SurgeryRoute[]) {
    const rows = selectSurgeryPrices(route, priceBlocks);
    assert.equal(rows.length, surgeryPages[route].priceNames.length + 2);
    for (const row of rows) {
      assert.equal(row.cost, costs.get(row.name));
      assert.ok(priceBlocks.some((block) => block.rows.includes(row)));
    }
    assert.equal(rows.find((row) => row.name === "Прицільний рентген")?.note, "Окремо не тарифікується.");
    assert.deepEqual(selectSurgeryPrices(route, []), []);
  }
  const updated = [{ ...priceBlocks[5], rows: [{ name: "Видалення зуба", cost: "QA updated", note: "QA current note" }, { name: "Видалення зуба — інше", cost: "exclude" }, { name: "Імплантація", cost: "exclude" }] }];
  assert.deepEqual(selectSurgeryPrices("extraction", updated), [updated[0].rows[0]]);
  assert.deepEqual(selectSurgeryPrices("wisdom", updated), []);
  for (const file of ["src/data/surgery-pages.ts", "src/SurgeryPage.tsx"]) assert.doesNotMatch(fs.readFileSync(file, "utf8"), /\d[\d ]*\s*грн|cost\s*:/);
});

test("surgery schema has clinic provider, visible service parity, correct parent and no inferred Person", () => {
  for (const route of Object.keys(surgeryPages) as SurgeryRoute[]) {
    const page = surgeryPages[route], url = "https://dentix.ua/" + page.path;
    const graph = buildEntitySchema(route, clinic as any, approvedRoles)["@graph"];
    assert.deepEqual(graph.filter((node) => node["@type"] === "Person"), []);
    assert.deepEqual(graph.find((node) => node["@type"] === "Service"), { "@type": "Service", "@id": url + "#service", name: page.h1, url, description: page.answer, provider: { "@id": "https://dentix.ua/#dentist" } });
    assert.deepEqual(graph.map((node) => node["@type"]), ["WebSite", "WebPage", "Dentist", "Service", "BreadcrumbList"]);
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList")?.itemListElement as { position: number; name: string; item: string }[];
    assert.equal(crumbs.length, route === "surgery" ? 2 : 3);
    if (route !== "surgery") assert.equal(crumbs[1].item, "https://dentix.ua/khirurhichna-stomatolohiia/");
    assert.equal(crumbs.at(-1)?.name, page.label);
    assert.equal(crumbs.at(-1)?.item, url);
    assert.doesNotMatch(JSON.stringify(graph), /Offer|priceRange|MedicalProcedure|medicalSpecialty|FAQPage|AggregateRating|Review|guarantee|successRate|anesthesia|recovery/);
    const changed = buildEntitySchema(route, clinic as any, [...approvedRoles, doctor("new", "Лікар-хірург")])["@graph"];
    assert.deepEqual(changed.filter((node) => node["@type"] === "Person").map((node) => [node.name, node.jobTitle]), [["Fixture new", "Лікар-хірург"]]);
    assert.deepEqual(buildEntitySchema(route, clinic as any, [doctor("new", "Лікар-терапевт")])["@graph"].filter((node) => node["@type"] === "Person"), []);
  }
});

test("distinct surgery scopes and copy exclude clinical guidance and implantation", () => {
  assert.deepEqual(surgeryPages.extraction.scope, ["Видалення зуба", "Складне видалення ретинованого зуба"]);
  assert.deepEqual(surgeryPages.wisdom.scope, ["Видалення зуба мудрості"]);
  assert.doesNotMatch(surgeryPages.wisdom.answer, /ретинован/);
  for (const page of Object.values(surgeryPages)) {
    assert.match(page.h1, /Дніпрі/);
    assert.doesNotMatch(JSON.stringify(page), /імплант|безболіс|гарант|успішн|симптом|протипоказ|анестез|седац|відновлен|ускладнен|хвилин|триваліст|технік|100%/i);
  }
});

test("real surgery SSR exposes fallback prices/contact with zero content requests or surgeon cards", async () => {
  const { createServer } = await import("vite");
  const previous = process.env.VITE_DENTIX_CONTENT_API_URL;
  const originalFetch = globalThis.fetch;
  let fetches = 0;
  process.env.VITE_DENTIX_CONTENT_API_URL = "http://127.0.0.1:49151/__qa/content";
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  globalThis.fetch = (() => { fetches++; throw new Error("SSR network forbidden"); }) as typeof fetch;
  try {
    const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
    for (const route of Object.keys(surgeryPages) as SurgeryRoute[]) {
      const html = render(route);
      assert.ok(html.includes(surgeryPages[route].h1));
      for (const row of selectSurgeryPrices(route, priceBlocks)) assert.ok(html.includes(row.cost));
      assert.ok(html.includes("Уточніть лікаря цього напрямку у клініці телефоном."));
      assert.doesNotMatch(html, /class="doc-role"|#person-|Стасюк|Подолянский|Грисяк|Гамаза/);
      assert.equal(html.includes('id="complex-extraction"'), route === "extraction");
    }
    assert.equal(fetches, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.VITE_DENTIX_CONTENT_API_URL;
    else process.env.VITE_DENTIX_CONTENT_API_URL = previous;
    await server.close();
  }
});
