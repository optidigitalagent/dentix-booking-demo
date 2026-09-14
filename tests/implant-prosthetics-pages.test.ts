import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { implantProstheticsPages, selectImplantProstheticsDoctors, selectImplantProstheticsPrices, type ImplantProstheticsRoute } from "../src/data/implant-prosthetics-pages.ts";
import { priceBlocks } from "../src/data/prices.ts";
import { buildEntitySchema } from "../src/lib/entity-schema.ts";

const source = fs.readFileSync("src/data/site.ts", "utf8");
const clinic = Object.fromEntries([...source.matchAll(/^  (\w+): "([^"]*)",/gm)].map((match) => [match[1], match[2]]));
clinic.logo = "/assets/logo.png";
const doctor = (id: string, role: string) => ({ id, role, name: `Fixture ${id}`, photo: "/assets/doctor.webp", alt: "", objectPosition: "center" });
const approvedRoles = [...fs.readFileSync("src/data/doctors.ts", "utf8").matchAll(/role: "([^"]+)"/g)].map((match, i) => doctor(String(i), match[1]));
const routes = Object.keys(implantProstheticsPages) as ImplantProstheticsRoute[];

test("no approved implantologist or orthopedist; exact hyphen/comma tokens only", () => {
  assert.equal(approvedRoles.length, 4);
  for (const route of routes) {
    assert.deepEqual(selectImplantProstheticsDoctors(route, approvedRoles), []);
    const role = route === "implantation" ? "імплантолог" : "ортопед";
    const team = [doctor("a", "Лікар-" + role), doctor("b", "стоматолог, " + role), doctor("c", "стоматолог, " + role + ", хірург"), doctor("d", role), doctor("e", role + "ія"), doctor("f", "помічник " + role + "а"), doctor("g", "нейро" + role), doctor("h", "Лікар-ортодонт"), doctor("i", "Лікар-хірург"), doctor("j", "Засновник клініки та головний лікар"), doctor("k", "qa_" + role), doctor("l", role + "2")];
    assert.deepEqual(selectImplantProstheticsDoctors(route, team).map(({ id }) => id), ["a", "b", "c", "d"]);
    assert.deepEqual(selectImplantProstheticsDoctors(route, []), []);
    assert.deepEqual(selectImplantProstheticsDoctors(route, [doctor("cross", route === "implantation" ? "Лікар-ортопед" : "Лікар-імплантолог")]), []);
  }
});

test("shared managed prices reflect client corrections and group implant prosthetics with implantation", () => {
  const expected = {
    implantation: ["Консультація стоматолога", "Прицільний рентген", "Імплант", "Цирконієва коронка на імпланті", "Імплантація All-on-4 (Корея)"],
    prosthetics: ["Консультація стоматолога", "Прицільний рентген", "Металокерамічна коронка", "Цирконієва коронка", "Мостоподібний протез"],
  };
  for (const route of routes) {
    const rows = selectImplantProstheticsPrices(route, priceBlocks);
    assert.deepEqual(rows.map((row) => row.name), expected[route]);
    for (const row of rows) assert.ok(priceBlocks.some((block) => block.rows.includes(row)), "original source row reference");
    assert.deepEqual(selectImplantProstheticsPrices(route, []), []);
    const updated = [{ ...priceBlocks[0], rows: [{ name: expected[route].at(-1)!, cost: "QA updated", note: "QA current note" }, { name: "QA unrelated service", cost: "exclude" }] }];
    assert.deepEqual(selectImplantProstheticsPrices(route, updated), [updated[0].rows[0]], "removed rows never restored");
    assert.deepEqual(selectImplantProstheticsPrices(route, [{ ...updated[0], rows: [updated[0].rows[1]] }]), []);
  }
  assert.deepEqual(selectImplantProstheticsPrices("implantation", priceBlocks).at(-1), { name: "Імплантація All-on-4 (Корея)", cost: "90 000 грн", note: "У вартість входять імпланти та протезування на імплантах." });
  assert.deepEqual(selectImplantProstheticsPrices("prosthetics", priceBlocks).at(-1), { name: "Мостоподібний протез", cost: "від 6 000 грн", note: "Фінальна вартість залежить від кількості зубів." });
  for (const file of ["src/data/implant-prosthetics-pages.ts", "src/ImplantProstheticsPage.tsx"]) assert.doesNotMatch(fs.readFileSync(file, "utf8"), /\d[\d ]*\s*грн|cost\s*:/);
});

test("service graphs have exact visible parity, clinic provider and zero fallback Person", () => {
  for (const route of routes) {
    const page = implantProstheticsPages[route], url = "https://dentix.ua/" + page.path;
    const graph = buildEntitySchema(route, clinic as any, approvedRoles)["@graph"];
    assert.deepEqual(graph.map((node) => node["@type"]), ["WebSite", "WebPage", "Dentist", "Service", "BreadcrumbList"]);
    assert.deepEqual(graph.find((node) => node["@type"] === "Service"), { "@type": "Service", "@id": url + "#service", name: page.h1, url, description: page.answer, provider: { "@id": "https://dentix.ua/#dentist" } });
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList")?.itemListElement as { position: number; name: string; item: string }[];
    assert.deepEqual(crumbs.map(({ position, name, item }) => [position, name, item]), [[1, "Головна", "https://dentix.ua/"], [2, page.label, url]]);
    assert.doesNotMatch(JSON.stringify(graph), /Product|Offer|priceRange|MedicalProcedure|medicalSpecialty|FAQPage|AggregateRating|Review|guarantee|successRate|anesthesia|recovery|Під ключ/);
    const role = route === "implantation" ? "Лікар-імплантолог" : "Лікар-ортопед";
    const team = [...approvedRoles, doctor("new", role), doctor("orthodontist", "Лікар-ортодонт")];
    const changed = buildEntitySchema(route, clinic as any, team)["@graph"];
    assert.deepEqual(changed.filter((node) => node["@type"] === "Person").map((node) => [node.name, node.jobTitle]), selectImplantProstheticsDoctors(route, team).map((d) => [d.name, d.role]));
    assert.equal(changed.filter((node) => node["@type"] === "Person").length, 1);
  }
});

test("legacy paths and client-confirmed scopes exclude unsupported clinical claims", () => {
  assert.equal(implantProstheticsPages.implantation.path, "implantatsiya/");
  assert.equal(implantProstheticsPages.prosthetics.path, "protezirovanie/");
  assert.deepEqual(implantProstheticsPages.implantation.scope, ["Імплант", "Цирконієва коронка на імпланті", "Імплантація All-on-4 (Корея)"]);
  assert.deepEqual(implantProstheticsPages.prosthetics.scope, ["Металокерамічна коронка", "Цирконієва коронка", "Мостоподібний протез"]);
  for (const page of Object.values(implantProstheticsPages)) {
    assert.match(page.h1, /Дніпрі/);
    assert.doesNotMatch(JSON.stringify(page), /під ключ|безболіс|гарант|успішн|симптом|протипоказ|анестез|седац|відновлен|ускладнен|хвилин|триваліст|прижив|навантаж|кістков|3D|(?<![\p{L}\p{N}_])КТ(?![\p{L}\p{N}_])|100%/iu);
  }
});

test("real implant/prosthetics SSR has approved fallback and zero content requests", async () => {
  const { createServer } = await import("vite");
  const previous = process.env.VITE_DENTIX_CONTENT_API_URL, originalFetch = globalThis.fetch;
  let fetches = 0;
  process.env.VITE_DENTIX_CONTENT_API_URL = "http://127.0.0.1:49151/__qa/content";
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  globalThis.fetch = (() => { fetches++; throw new Error("SSR network forbidden"); }) as typeof fetch;
  try {
    const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
    for (const route of routes) {
      const html = render(route);
      assert.ok(html.includes(implantProstheticsPages[route].h1));
      for (const row of selectImplantProstheticsPrices(route, priceBlocks)) assert.ok(html.includes(row.cost));
      assert.ok(html.includes("Уточніть лікаря цього напрямку у клініці телефоном."));
      assert.doesNotMatch(html, /class="doc-role"|#person-|Стасюк|Подолянский|Грисяк|Гамаза/);
    }
    assert.equal(fetches, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.VITE_DENTIX_CONTENT_API_URL;
    else process.env.VITE_DENTIX_CONTENT_API_URL = previous;
    await server.close();
  }
});
