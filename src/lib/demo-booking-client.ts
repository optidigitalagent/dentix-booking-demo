import type {
  AvailabilityDay,
  BookingCatalog,
  BookingConfirmation,
  DoctorServiceLink,
  CreateBookingInput,
} from "./booking-types";
import { BookingApiError } from "./booking-types";
import { bookingEndpoint, resolveBookingConfig } from "./booking-config";

const config = resolveBookingConfig({
  VITE_DENTIX_BOOKING_API_URL: import.meta.env["VITE_DENTIX_BOOKING_API_URL"],
  VITE_DENTIX_BOOKING_ENABLED: import.meta.env["VITE_DENTIX_BOOKING_ENABLED"],
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(bookingEndpoint(config, path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: { code?: string; message?: string };
  };
  if (!response.ok || !payload.data) {
    throw new BookingApiError(
      payload.error?.code ?? "BOOKING_API_ERROR",
      payload.error?.message ?? "Не вдалося виконати запит. Спробуйте ще раз.",
      response.status,
    );
  }
  return payload.data;
}

export const bookingClient = {
  enabled: config.enabled,
  mode: config.enabled ? ("test-ready" as const) : ("disabled" as const),
  async getCatalog() {
    const data = await request<{
      mode: "TEST_READY" | "LIVE_REQUESTS_READY" | "UNAVAILABLE"; testOnly: boolean; timezone: string;
      minDate: string; maxDate: string; consentVersion: string;
      doctors: Array<{ id: string; name: string; role_label: string }>;
      services: Array<{ id: string; name: string; category: string }>;
      doctorServices: DoctorServiceLink[];
    }>("/catalog");
    return {
      clinicTimezone: data.timezone,
      environment: data.testOnly ? "test-ready" : "production",
      mode: data.mode,
      testOnly: data.testOnly,
      minDate: data.minDate,
      maxDate: data.maxDate,
      consentVersion: data.consentVersion,
      services: data.services.map((item) => ({ id: item.id, name: item.name, category: item.category, demo: data.testOnly })),
      doctors: data.doctors.map((item) => ({ id: item.id, name: item.name, role: item.role_label, serviceIds: data.doctorServices.filter((link) => link.doctor_id === item.id).map((link) => link.service_id), demo: data.testOnly })),
      doctorServices: data.doctorServices ?? [],
    } satisfies BookingCatalog;
  },
  async getAvailability(serviceId: string, doctorId: string, date: string) {
    const data = await request<{ date: string; slots: Array<{ startsAt: string; endsAt: string; localStart: string; localEnd: string }> }>(
      `/availability?service_id=${encodeURIComponent(serviceId)}&doctor_id=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`,
    );
    return [{ date: data.date, label: new Intl.DateTimeFormat("uk-UA", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${data.date}T12:00:00Z`)), slots: data.slots.map((slot) => ({ startsAt: slot.startsAt, endsAt: slot.endsAt, label: slot.localStart })) }] satisfies AvailabilityDay[];
  },
  createAppointment: (input: CreateBookingInput) =>
    request<BookingConfirmation>("/requests", {
      method: "POST",
      headers: { "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify({ service_id: input.serviceId, doctor_id: input.doctorId, starts_at: input.startsAt, name: input.name, phone: input.phone, preferred_contact: "PHONE", consent: input.consent, consent_version: input.consentVersion, idempotency_key: input.idempotencyKey }),
    }),
};
