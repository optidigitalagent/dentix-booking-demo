import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { therapyPages, selectTherapyDoctors, selectTherapyPrices, type TherapyRoute } from "../src/data/therapy-pages.ts";
import { priceBlocks } from "../src/data/prices.ts";
import { buildEntitySchema } from "../src/lib/entity-schema.ts";

const source = fs.readFileSync("src/data/site.ts", "utf8");
const clinic = Object.fromEntries([...source.matchAll(/^  (\w+): "([^"]*)",/gm)].map((match) => [match[1], match[2]]));
clinic.logo = "/assets/logo.png";
const doctor = (id: string, role: string) => ({ id, role, name: `Fixture ${id}`, photo: "/assets/doctor.webp", alt: "", objectPosition: "center" });
const team = [doctor("a", "Лікар-терапевт, ендодонтист, мікроскопіст"), doctor("b", "Лікар-терапевт, гігієніст"), doctor("c", "ендодонтист"), doctor("d", "Лікар-ортодонт")];

test("doctor selection uses current roles and requires both microscope roles", () => {
  assert.deepEqual(selectTherapyDoctors("therapy", team).map(({ id }) => id), ["a", "b"]);
  assert.deepEqual(selectTherapyDoctors("caries", team).map(({ id }) => id), ["a", "b"]);
  assert.deepEqual(selectTherapyDoctors("microscope", team).map(({ id }) => id), ["a"]);
  assert.deepEqual(selectTherapyDoctors("microscope", team.map((person) => ({ ...person, role: "Лікар" }))), []);
});

test("service prices select exact shared row objects and never restore removed runtime values", () => {
  for (const route of Object.keys(therapyPages) as TherapyRoute[]) {
    const rows = selectTherapyPrices(route, priceBlocks);
    assert.equal(rows.length, therapyPages[route].priceNames.length + 2);
    assert.ok(rows.every((row) => priceBlocks.some((block) => block.rows.includes(row))));
  }
  const updated = [{ ...priceBlocks[3], rows: [{ name: "Лікування карієсу", cost: "QA changed price", note: "QA note" }, { name: "Лікування карієсу — інша послуга", cost: "exclude" }] }];
  assert.deepEqual(selectTherapyPrices("caries", updated), [updated[0].rows[0]]);
  assert.deepEqual(selectTherapyPrices("microscope", updated), []);
  assert.deepEqual(selectTherapyPrices("therapy", []), []);
  assert.doesNotMatch(fs.readFileSync("src/data/therapy-pages.ts", "utf8"), /\d[\d ]*\s*грн|cost\s*:/);
});

test("service graph and breadcrumb match visible route copy and selected managed people", () => {
  for (const route of Object.keys(therapyPages) as TherapyRoute[]) {
    const page = therapyPages[route], url = "https://dentix.ua/" + page.path;
    const graph = buildEntitySchema(route, clinic as any, team)["@graph"];
    const service = graph.find((node) => node["@type"] === "Service");
    assert.deepEqual(service, { "@type": "Service", "@id": url + "#service", name: page.h1, url, description: page.answer, provider: { "@id": "https://dentix.ua/#dentist" } });
    assert.deepEqual(graph.filter((node) => node["@type"] === "Person").map((node) => node.name), selectTherapyDoctors(route, team).map(({ name }) => name));
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList")?.itemListElement as { position: number; name: string; item: string }[];
    assert.equal(crumbs.length, route === "therapy" ? 2 : 3);
    assert.equal(crumbs.at(-1)?.name, page.label);
    assert.equal(crumbs.at(-1)?.item, url);
    assert.doesNotMatch(JSON.stringify(graph), /Offer|priceRange|MedicalProcedure|medicalSpecialty|FAQPage|AggregateRating|Review|guarantee|successRate/);
    const changed = buildEntitySchema(route, clinic as any, [doctor("new", "Лікар-терапевт, ендодонтист, мікроскопіст")])["@graph"];
    assert.deepEqual(changed.filter((node) => node["@type"] === "Person").map((node) => node.name), ["Fixture new"]);
  }
});

test("clinical boundary and distinct caries scope remain explicit", () => {
  assert.deepEqual(therapyPages.caries.scope, ["Лікування карієсу", "Художня реставрація"]);
  assert.doesNotMatch(therapyPages.caries.answer, /канал|мікроскоп/);
  assert.equal(therapyPages.microscope.path, "lechenie-pod-mikroskopom/");
  for (const page of Object.values(therapyPages)) {
    assert.match(page.h1, /Дніпрі/);
    assert.doesNotMatch(JSON.stringify(page), /безболіс|гарант|успішн|симптом|протипоказ|анестез|відвідувань|хвилин|Zeiss|Leica|100%/i);
  }
});

test("real SSR renders fallback with a configured content endpoint and zero fetch calls", async () => {
  const { createServer } = await import("vite");
  const previous = process.env.VITE_DENTIX_CONTENT_API_URL;
  const originalFetch = globalThis.fetch;
  let fetches = 0;
  process.env.VITE_DENTIX_CONTENT_API_URL = "http://127.0.0.1:49151/__qa/content";
  const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  globalThis.fetch = (() => { fetches++; throw new Error("SSR network forbidden"); }) as typeof fetch;
  try {
    const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
    for (const route of Object.keys(therapyPages) as TherapyRoute[]) {
      const html = render(route);
      assert.ok(html.includes(therapyPages[route].h1));
      for (const row of selectTherapyPrices(route, priceBlocks)) assert.ok(html.includes(row.cost));
    }
    assert.equal(fetches, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.VITE_DENTIX_CONTENT_API_URL;
    else process.env.VITE_DENTIX_CONTENT_API_URL = previous;
    await server.close();
  }
});
