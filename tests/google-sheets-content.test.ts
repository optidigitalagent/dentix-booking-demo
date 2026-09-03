import assert from "node:assert/strict";
import test from "node:test";
import type { Doctor } from "../src/data/doctors.ts";
import type { PriceBlock } from "../src/data/prices.ts";
import {
  loadGoogleSheetsContent,
  normalizeDoctorRows,
  normalizePriceRows,
} from "../src/lib/google-sheets-content.ts";

const fallbackDoctors: Doctor[] = [
  {
    id: "olena-hamaza",
    name: "Локальне ім’я",
    role: "Локальна роль",
    photo: "/local/olena.webp",
    alt: "Локальне фото",
    objectPosition: "center top",
  },
];

const fallbackPriceBlocks: PriceBlock[] = [
  {
    id: "fallback",
    num: "01",
    kicker: "Fallback",
    title: "Fallback",
    rows: [{ name: "Fallback", cost: "Fallback" }],
  },
];

test("normalizes published doctors, sorts rows, and retains an approved local photo by id", () => {
  const doctors = normalizeDoctorRows(
    [
      {
        id: "new-doctor",
        full_name: "Новий лікар",
        role: "Підтверджена роль",
        photo_url: "https://cdn.example.com/new.webp",
        sort_order: "20",
        is_published: "TRUE",
      },
      {
        id: "olena-hamaza",
        full_name: "Гамаза Олена Анатоліївна",
        role: "Лікар-терапевт, гігієніст",
        photo_url: "",
        sort_order: "10",
      },
      {
        id: "hidden-doctor",
        full_name: "Hidden",
        role: "Hidden",
        photo_url: "https://cdn.example.com/hidden.webp",
        is_published: "FALSE",
      },
      {
        id: "unsafe id",
        full_name: "Unsafe",
        role: "Unsafe",
        photo_url: "http://example.com/unsafe.webp",
      },
    ],
    fallbackDoctors,
  );

  assert.deepEqual(
    doctors.map((doctor) => doctor.id),
    ["olena-hamaza", "new-doctor"],
  );
  assert.equal(doctors[0]?.photo, "/local/olena.webp");
  assert.equal(doctors[1]?.photo, "https://cdn.example.com/new.webp");
});
test("groups and sorts published price rows, preserves notes, and drops duplicate ids", () => {
  const blocks = normalizePriceRows([
    {
      id: "service-b",
      category_id: "therapy",
      category: "Терапія",
      category_title: "Терапевтичні послуги",
      service_name: "Послуга B",
      price: "2000 грн",
      price_note: "Підтверджена примітка",
      category_order: "2",
      sort_order: "20",
    },
    {
      id: "service-a",
      category_id: "therapy",
      category: "Терапія",
      category_title: "Терапевтичні послуги",
      service_name: "Послуга A",
      price: "1000 грн",
      category_order: "2",
      sort_order: "10",
    },
    {
      id: "service-a",
      category_id: "other",
      category: "Duplicate",
      service_name: "Duplicate",
      price: "1 грн",
    },
    {
      id: "hidden",
      category_id: "hidden",
      category: "Hidden",
      service_name: "Hidden",
      price: "1 грн",
      is_published: false,
    },
  ]);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]?.id, "therapy");
  assert.deepEqual(
    blocks[0]?.rows.map((row) => row.name),
    ["Послуга A", "Послуга B"],
  );
  assert.equal(blocks[0]?.rows[1]?.note, "Підтверджена примітка");
});

test("uses independent section fallback for a valid partial endpoint response", async () => {
  const result = await loadGoogleSheetsContent({
    endpoint: "https://example.com/content",
    fallbackDoctors,
    fallbackPriceBlocks,
    fetchImpl: (async () =>
      new Response(
        JSON.stringify({
          doctors: [
            {
              id: "olena-hamaza",
              full_name: "Гамаза Олена Анатоліївна",
              role: "Лікар-терапевт, гігієніст",
            },
          ],
          price: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch,
  });

  assert.equal(result.status, "partial-fallback");
  assert.equal(result.doctorsSource, "google-sheets");
  assert.equal(result.priceSource, "local-fallback");
  assert.strictEqual(result.priceBlocks, fallbackPriceBlocks);
});

test("keeps the complete local fallback when the endpoint is missing or unavailable", async () => {
  const missing = await loadGoogleSheetsContent({
    endpoint: "",
    fallbackDoctors,
    fallbackPriceBlocks,
  });
  assert.equal(missing.reason, "not-configured");
  assert.strictEqual(missing.doctors, fallbackDoctors);

  const unavailable = await loadGoogleSheetsContent({
    endpoint: "https://example.com/content",
    fallbackDoctors,
    fallbackPriceBlocks,
    fetchImpl: (async () => {
      throw new Error("offline");
    }) as typeof fetch,
  });
  assert.equal(unavailable.reason, "fetch-failed");
  assert.strictEqual(unavailable.priceBlocks, fallbackPriceBlocks);
});
