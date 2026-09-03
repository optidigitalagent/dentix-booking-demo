import { useEffect, useState } from "react";
import { doctors as fallbackDoctors } from "@/data/doctors";
import { priceBlocks as fallbackPriceBlocks } from "@/data/prices";
import {
  loadGoogleSheetsContent,
  type GoogleSheetsContentResult,
} from "@/lib/google-sheets-content";

const endpoint = import.meta.env.VITE_DENTIX_CONTENT_API_URL?.trim() ?? "";
const configuredTimeout = Number(import.meta.env.VITE_DENTIX_CONTENT_TIMEOUT_MS);
const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 4000;

export const googleSheetsConnectionStatus = endpoint
  ? "CONFIGURED"
  : "READY_FOR_GOOGLE_SHEETS_CONNECTION";

const initialContent: GoogleSheetsContentResult = {
  doctors: fallbackDoctors,
  priceBlocks: fallbackPriceBlocks,
  doctorsSource: "local-fallback",
  priceSource: "local-fallback",
  status: "fallback",
  reason: endpoint ? "invalid-data" : "not-configured",
};

let contentPromise: Promise<GoogleSheetsContentResult> | undefined;

function getManagedContent() {
  contentPromise ??= loadGoogleSheetsContent({
    endpoint,
    fallbackDoctors,
    fallbackPriceBlocks,
    timeoutMs,
  });
  return contentPromise;
}

export function useManagedContent() {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    let active = true;
    void getManagedContent().then((nextContent) => {
      if (active) setContent(nextContent);
    });
    return () => {
      active = false;
    };
  }, []);

  return content;
}
