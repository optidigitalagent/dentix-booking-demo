import type { Doctor } from "@/data/doctors";
import type { PriceBlock, PriceRow } from "@/data/prices";

export type ContentSource = "google-sheets" | "local-fallback";
export type ContentStatus = "connected" | "partial-fallback" | "fallback";
type ContentReason = "not-configured" | "invalid-endpoint" | "fetch-failed" | "invalid-data";

export type GoogleSheetsContentResult = {
  doctors: Doctor[];
  priceBlocks: PriceBlock[];
  doctorsSource: ContentSource;
  priceSource: ContentSource;
  status: ContentStatus;
  reason?: ContentReason;
};

type LoadContentOptions = {
  endpoint: string;
  fallbackDoctors: Doctor[];
  fallbackPriceBlocks: PriceBlock[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

type Row = Record<string, unknown>;

function isRow(value: unknown): value is Row {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function order(value: unknown, fallback = Number.MAX_SAFE_INTEGER) {
  if (!text(value)) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeId(value: unknown) {
  const candidate = text(value);
  return /^[a-z0-9][a-z0-9_-]*$/i.test(candidate) ? candidate : "";
}

function isPublished(value: unknown) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "boolean") return value;
  return !["0", "false", "no", "ні", "нет", "off"].includes(text(value).toLowerCase());
}

function safePhotoUrl(value: unknown) {
  const candidate = text(value);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function rowsFrom(payload: unknown, key: "doctors" | "price") {
  if (!isRow(payload) || !Array.isArray(payload[key])) return [];
  return payload[key].filter(isRow);
}

export function normalizeDoctorRows(rows: Row[], fallbackDoctors: Doctor[]) {
  const fallbackById = new Map(fallbackDoctors.map((doctor) => [doctor.id, doctor]));
  const seen = new Set<string>();

  return rows
    .filter((row) => isPublished(row["is_published"]))
    .map((row) => {
      const id = safeId(row["id"]);
      const name = text(row["full_name"]);
      const role = text(row["role"]);
      const fallback = fallbackById.get(id);
      const photo = safePhotoUrl(row["photo_url"]) || fallback?.photo || "";
      if (!id || !name || !role || !photo || seen.has(id)) return null;
      seen.add(id);

      const description = text(row["description"]);
      const doctor: Doctor & { sortOrder: number } = {
        id,
        name,
        role,
        photo,
        alt: text(row["photo_alt"]) || `${name}, ${role} DENTIX`,
        objectPosition: fallback?.objectPosition || "center top",
        sortOrder: order(row["sort_order"]),
      };
      if (description) doctor.description = description;
      return doctor;
    })
    .filter((doctor): doctor is Doctor & { sortOrder: number } => doctor !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "uk"))
    .map(({ sortOrder: _sortOrder, ...doctor }) => doctor);
}

export function normalizePriceRows(rows: Row[]) {
  const seen = new Set<string>();
  const published = rows
    .filter((row) => isPublished(row["is_published"]))
    .map((row) => ({
      id: safeId(row["id"]),
      categoryId: safeId(row["category_id"]),
      category: text(row["category"]),
      categoryTitle: text(row["category_title"]),
      serviceName: text(row["service_name"]),
      price: text(row["price"]),
      priceNote: text(row["price_note"]),
      categoryOrder: order(row["category_order"]),
      sortOrder: order(row["sort_order"]),
    }))
    .filter((row) => row.id && row.categoryId && row.category && row.serviceName && row.price)
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });

  const groups = new Map<
    string,
    {
      category: string;
      title: string;
      categoryOrder: number;
      rows: Array<PriceRow & { id: string; sortOrder: number }>;
    }
  >();

  for (const row of published) {
    const group = groups.get(row.categoryId) ?? {
      category: row.category,
      title: row.categoryTitle || row.category,
      categoryOrder: row.categoryOrder,
      rows: [],
    };
    const priceRow: PriceRow & { id: string; sortOrder: number } = {
      id: row.id,
      name: row.serviceName,
      cost: row.price,
      sortOrder: row.sortOrder,
    };
    if (row.priceNote) priceRow.note = row.priceNote;
    group.rows.push(priceRow);
    group.categoryOrder = Math.min(group.categoryOrder, row.categoryOrder);
    groups.set(row.categoryId, group);
  }

  return [...groups.entries()]
    .sort((left, right) => left[1].categoryOrder - right[1].categoryOrder || left[0].localeCompare(right[0]))
    .map(([id, group], index): PriceBlock => ({
      id,
      num: String(index + 1).padStart(2, "0"),
      kicker: group.category,
      title: group.title,
      rows: group.rows
        .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id))
        .map(({ id: _id, sortOrder: _sortOrder, ...row }) => row),
    }));
}

function fallbackResult(
  fallbackDoctors: Doctor[],
  fallbackPriceBlocks: PriceBlock[],
  reason: ContentReason,
): GoogleSheetsContentResult {
  return {
    doctors: fallbackDoctors,
    priceBlocks: fallbackPriceBlocks,
    doctorsSource: "local-fallback",
    priceSource: "local-fallback",
    status: "fallback",
    reason,
  };
}

export async function loadGoogleSheetsContent({
  endpoint,
  fallbackDoctors,
  fallbackPriceBlocks,
  timeoutMs = 4000,
  fetchImpl = fetch,
}: LoadContentOptions): Promise<GoogleSheetsContentResult> {
  if (!endpoint) return fallbackResult(fallbackDoctors, fallbackPriceBlocks, "not-configured");

  let url: URL;
  try {
    url = new URL(endpoint);
    const localDevelopment = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !localDevelopment) {
      return fallbackResult(fallbackDoctors, fallbackPriceBlocks, "invalid-endpoint");
    }
  } catch {
    return fallbackResult(fallbackDoctors, fallbackPriceBlocks, "invalid-endpoint");
  }

  url.searchParams.set("_content_version", String(Date.now()));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Google Sheets endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    const doctorRows = rowsFrom(payload, "doctors");
    const priceRows = rowsFrom(payload, "price");
    const remoteDoctors = normalizeDoctorRows(doctorRows, fallbackDoctors);
    const remotePriceBlocks = normalizePriceRows(priceRows);
    const doctorsSource: ContentSource = remoteDoctors.length ? "google-sheets" : "local-fallback";
    const priceSource: ContentSource = remotePriceBlocks.length ? "google-sheets" : "local-fallback";

    return {
      doctors: remoteDoctors.length ? remoteDoctors : fallbackDoctors,
      priceBlocks: remotePriceBlocks.length ? remotePriceBlocks : fallbackPriceBlocks,
      doctorsSource,
      priceSource,
      status:
        doctorsSource === "google-sheets" && priceSource === "google-sheets"
          ? "connected"
          : doctorsSource === "google-sheets" || priceSource === "google-sheets"
            ? "partial-fallback"
            : "fallback",
      ...(doctorsSource === "local-fallback" && priceSource === "local-fallback"
        ? { reason: "invalid-data" as const }
        : {}),
    };
  } catch {
    return fallbackResult(fallbackDoctors, fallbackPriceBlocks, "fetch-failed");
  } finally {
    clearTimeout(timeout);
  }
}
