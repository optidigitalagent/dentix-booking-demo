import { BookingApiError } from "./booking-types";

export type BookingRuntimeEnv = {
  VITE_DENTIX_BOOKING_API_URL?: string | undefined;
  VITE_DENTIX_BOOKING_ENABLED?: string | undefined;
};

export type BookingRuntimeConfig = {
  apiUrl: string;
  enabled: boolean;
};

export function resolveBookingConfig(env: BookingRuntimeEnv): BookingRuntimeConfig {
  const apiUrl = (env.VITE_DENTIX_BOOKING_API_URL ?? "").trim().replace(/\/+$/, "");
  return {
    apiUrl,
    enabled: env.VITE_DENTIX_BOOKING_ENABLED === "true" && apiUrl.length > 0,
  };
}

export function bookingEndpoint(config: BookingRuntimeConfig, path: string) {
  if (!config.enabled || !config.apiUrl) {
    throw new BookingApiError(
      "BOOKING_BACKEND_NOT_CONFIGURED",
      "Онлайн-запис ще не підключено. Будь ласка, зателефонуйте до клініки.",
      503,
    );
  }
  return `${config.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
