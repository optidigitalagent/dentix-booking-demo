export function hasServiceDuration(minutes: number | null | undefined): minutes is number {
  return Number.isInteger(minutes) && (minutes ?? 0) >= 1 && (minutes ?? 0) <= 480;
}
