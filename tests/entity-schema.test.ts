import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { buildEntitySchema } from "../src/lib/entity-schema.ts";

// Read literal fields from the pinned source without evaluating its asset imports.
const source = fs.readFileSync("src/data/site.ts", "utf8");
const clinic = Object.fromEntries([...source.matchAll(/^  (\w+): "([^"]*)",/gm)].map((match) => [match[1], match[2]]));
clinic.logo = "/assets/logo.png";
clinic.mapLink = "https://maps.app.goo.gl/jB5eSXHDwYmx6cZs9?g_st=ic";
const doctor = { id: "stanislav-stasiuk", name: "Стасюк Станіслав Ігорович", role: "Засновник клініки та головний лікар", photo: "/assets/founder.webp", alt: "", objectPosition: "center" };

test("schema follows the supplied managed team and omits unsafe image and founder assumptions", () => {
  const graph = buildEntitySchema("doctors", clinic as any, [doctor])["@graph"];
  assert.equal(graph.find((node) => node["@type"] === "Person")?.image, "https://dentix.ua/assets/founder.webp");
  for (const photo of ["https://other.example/doctor.webp", "data:image/png;base64,AA", "/private/doctor.webp"]) {
    const changed = buildEntitySchema("doctors", clinic as any, [{ ...doctor, role: "Лікар", photo }])["@graph"];
    assert.equal(changed.find((node) => node["@type"] === "Person")?.image, undefined);
    assert.equal(changed.find((node) => node["@type"] === "Dentist")?.founder, undefined);
  }
  assert.equal(buildEntitySchema("doctors", clinic as any, [])["@graph"].filter((node) => node["@type"] === "Person").length, 0);
});

test("unknown hours/address formats require review instead of inferred structured facts", () => {
  for (const field of ["schedule", "scheduleNote", "city"]) assert.throws(() => buildEntitySchema("contacts", { ...clinic, [field]: "unknown" } as any, []), /requires review/);
});
