export type IntakeStatus = {
  lead: { enabled: boolean; mode: "LIVE" | "UNAVAILABLE"; policyUrl: string | null; consentVersion: string };
  timed: { enabled: boolean; mode: "LIVE" | "UNAVAILABLE"; policyUrl: string | null; consentVersion: string };
};

export async function getIntakeStatus(): Promise<IntakeStatus> {
  const bookingUrl = import.meta.env["VITE_DENTIX_BOOKING_API_URL"]?.trim().replace(/\/+$/, "");
  const leadUrl = import.meta.env.VITE_DENTIX_LEADS_API_URL?.trim();
  const base = bookingUrl || leadUrl?.replace(/\/leads\/?$/, "/booking");
  if (!base) throw new Error("Форма ще не активована. Зателефонуйте до клініки.");
  const response = await fetch(`${base}/intake-status`, { headers: { Accept: "application/json" }, cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.data) throw new Error("Не вдалося перевірити доступність форми. Спробуйте пізніше або зателефонуйте.");
  return payload.data as IntakeStatus;
}
