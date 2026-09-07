import type { BookingMapping, BookingMode } from "./booking-types";

// Old/global durations never authorize a public time selector.
export function isExactMapping(mapping: BookingMapping): boolean {
  return mapping.active === true && mapping.public_bookable === true &&
    (mapping.booking_mode === "DIRECT_SLOT" || mapping.booking_mode === "CONSULTATION_SLOT") &&
    Number.isInteger(mapping.reservation_duration_minutes) && (mapping.reservation_duration_minutes ?? 0) > 0 &&
    Boolean(mapping.scheduled_service_id) &&
    (mapping.booking_mode !== "CONSULTATION_SLOT" || Boolean(mapping.consultation_service_id));
}

export function bookingModeLabel(mode: BookingMode): string {
  return mode === "DIRECT_SLOT" ? "Запит на прийом" : mode === "CONSULTATION_SLOT" ? "Запит на консультацію" : "Заявка без вибору часу";
}
