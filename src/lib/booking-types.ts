export type DoctorServiceLink = {
  doctor_id: string;
  service_id: string;
  active: boolean;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
};
export type BookingService = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number | null;
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
  durationMinutes?: number;
  slots: Array<{ startsAt: string; endsAt: string; label: string }>;
};

export type BookingCatalog = {
  clinicTimezone: string;
  environment: "test-ready" | "production";
  mode: "TEST_READY" | "LIVE_REQUESTS_READY" | "UNAVAILABLE";
  testOnly: boolean;
  minDate: string;
  maxDate: string;
  consentVersion: string;
  services: BookingService[];
  doctors: BookingDoctor[];
  doctorServices: DoctorServiceLink[];
};

export type CreateBookingInput = {
  serviceId: string;
  doctorId: string;
  startsAt: string;
  name: string;
  phone: string;
  consent: true;
  idempotencyKey: string;
  consentVersion: string;
};

export type BookingConfirmation = {
  appointmentId: string;
  reference: string;
  status: "AWAITING_CALLBACK";
  revision: number;
  message: string;
  startsAt: string;
  endsAt: string;
  serviceName?: string;
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
