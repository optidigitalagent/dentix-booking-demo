export type BookingService = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  demo?: boolean;
};

export type BookingDoctor = {
  id: string;
  name: string;
  role: string;
  serviceIds: string[];
  demo?: boolean;
};

export type AvailabilityDay = {
  date: string;
  label: string;
  slots: Array<{ startsAt: string; label: string }>;
};

export type BookingCatalog = {
  clinicTimezone: string;
  environment: "development" | "production";
  services: BookingService[];
  doctors: BookingDoctor[];
};

export type CreateBookingInput = {
  serviceId: string;
  doctorId: string;
  startsAt: string;
  name: string;
  phone: string;
  consent: true;
  idempotencyKey: string;
};

export type BookingConfirmation = {
  appointmentId: string;
  reference: string;
  status: "CONFIRMED";
  calendarSyncStatus: "PENDING" | "SYNCED" | "RETRYING" | "NOT_CONNECTED";
  service: string;
  doctor: string;
  startsAt: string;
  clinicTimezone: string;
  environment: "development" | "production";
};

export class BookingApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = "BookingApiError";
    this.code = code;
    this.status = status;
  }
}
