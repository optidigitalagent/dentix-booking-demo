import type {
  AvailabilityDay,
  BookingCatalog,
  BookingConfirmation,
  CreateBookingInput,
} from "./booking-types";

const catalog: BookingCatalog = {
  clinicTimezone: "Europe/Kyiv",
  environment: "development",
  services: [
    { id: "demo-hygiene", name: "DEMO Послуга 01 · Професійна гігієна", category: "Демонстраційні дані", durationMinutes: 60, demo: true },
    { id: "demo-therapy", name: "DEMO Послуга 02 · Консультація терапевта", category: "Демонстраційні дані", durationMinutes: 45, demo: true },
    { id: "demo-ortho", name: "DEMO Послуга 03 · Консультація ортодонта", category: "Демонстраційні дані", durationMinutes: 45, demo: true },
  ],
  doctors: [
    { id: "demo-doctor-a", name: "DEMO Лікар 01", role: "Стоматолог-терапевт", serviceIds: ["demo-hygiene", "demo-therapy"], demo: true },
    { id: "demo-doctor-b", name: "DEMO Лікар 02", role: "Лікар-ортодонт", serviceIds: ["demo-hygiene", "demo-ortho"], demo: true },
  ],
};

function makeAvailability(): AvailabilityDay[] {
  const formatter = new Intl.DateTimeFormat("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Kyiv",
  });
  const days: AvailabilityDay[] = [];
  const cursor = new Date();

  for (let offset = 1; days.length < 4 && offset < 10; offset += 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + offset);
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    const date = day.toISOString().slice(0, 10);
    const slots = ["09:30", "11:00", "14:30", "16:00"].map((time) => {
      const startsAt = new Date(`${date}T${time}:00+03:00`).toISOString();
      return { startsAt, label: time };
    });
    days.push({ date, label: formatter.format(day), slots });
  }

  return days;
}

export const bookingClient = {
  enabled: true,
  mode: "demo" as const,
  async getCatalog() {
    return structuredClone(catalog);
  },
  async getAvailability(_serviceId: string, _doctorId: string) {
    return makeAvailability();
  },
  async createAppointment(input: CreateBookingInput): Promise<BookingConfirmation> {
    const service = catalog.services.find((item) => item.id === input.serviceId);
    const doctor = catalog.doctors.find((item) => item.id === input.doctorId);
    if (!service || !doctor) throw new Error("DEMO_FIXTURE_NOT_FOUND");

    return {
      appointmentId: `demo-${Date.now()}`,
      reference: `DEMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status: "CONFIRMED",
      calendarSyncStatus: "NOT_CONNECTED",
      service: service.name,
      doctor: doctor.name,
      startsAt: input.startsAt,
      clinicTimezone: catalog.clinicTimezone,
      environment: "development",
    };
  },
};
