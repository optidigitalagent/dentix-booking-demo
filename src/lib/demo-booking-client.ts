import type { AvailabilityDay, BookingCatalog, BookingConfirmation, CreateBookingInput } from "./booking-types";
import { BookingApiError } from "./booking-types";

const apiUrl = (import.meta.env["VITE_DENTIX_BOOKING_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";
const enabled = import.meta.env["VITE_DENTIX_BOOKING_ENABLED"] === "true" && Boolean(apiUrl);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!enabled) throw new BookingApiError("BOOKING_BACKEND_NOT_CONFIGURED", "Запити на час ще не підключено.", 503);
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const payload = await response.json().catch(() => ({})) as { data?: T; error?: { code?: string; message?: string } };
  if (!response.ok || !payload.data) throw new BookingApiError(payload.error?.code ?? "BOOKING_API_ERROR", payload.error?.message ?? "Не вдалося виконати запит.", response.status);
  return payload.data;
}

export const bookingClient = {
  enabled,
  mode: enabled ? "test-ready" as const : "disabled" as const,
  async getCatalog() {
    const data = await request<{ mode: "TEST_READY" | "LIVE_REQUESTS_READY"; testOnly: boolean; timezone: string; requestDurationMinutes: number; minDate: string; maxDate: string; consentVersion: string; doctors: Array<{ id: string; name: string; role_label: string }>; services: Array<{ id: string; name: string; category: string }>; doctorServices: Array<{ doctor_id: string; service_id: string }> }>("/catalog");
    return { clinicTimezone: data.timezone, environment: data.testOnly ? "test-ready" : "production", mode: data.mode, testOnly: data.testOnly, requestDurationMinutes: data.requestDurationMinutes, minDate: data.minDate, maxDate: data.maxDate, consentVersion: data.consentVersion, services: data.services.map((item) => ({ id: item.id, name: item.name, category: item.category, durationMinutes: data.requestDurationMinutes, demo: data.testOnly })), doctors: data.doctors.map((item) => ({ id: item.id, name: item.name, role: item.role_label, serviceIds: data.doctorServices.filter((link) => link.doctor_id === item.id).map((link) => link.service_id), demo: data.testOnly })) } satisfies BookingCatalog;
  },
  async getAvailability(serviceId: string, doctorId: string, date: string) {
    const data = await request<{ date: string; slots: Array<{ startsAt: string; endsAt: string; localStart: string; localEnd: string }> }>(`/availability?service_id=${encodeURIComponent(serviceId)}&doctor_id=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
    return [{ date: data.date, label: new Intl.DateTimeFormat("uk-UA", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${data.date}T12:00:00Z`)), slots: data.slots.map((slot) => ({ startsAt: slot.startsAt, endsAt: slot.endsAt, label: `${slot.localStart}–${slot.localEnd}` })) }] satisfies AvailabilityDay[];
  },
  createAppointment(input: CreateBookingInput) {
    return request<BookingConfirmation>("/requests", { method: "POST", headers: { "Idempotency-Key": input.idempotencyKey }, body: JSON.stringify({ service_id: input.serviceId, doctor_id: input.doctorId, starts_at: input.startsAt, name: input.name, phone: input.phone, preferred_contact: "PHONE", consent_version: "booking-request-test-v1", test_submission: input.testSubmission, idempotency_key: input.idempotencyKey }) });
  },
};
