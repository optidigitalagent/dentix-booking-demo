export type BuildTarget = "preview" | "production";

export function getBuildProfile(target: string) {
  if (target !== "preview" && target !== "production") {
    throw new Error(`Unknown DENTIX build target: ${target}`);
  }
  return {
    target,
    leadSource: target === "preview" ? "PUBLIC_DEMO" : "CANONICAL_CANDIDATE",
    base: target === "preview" ? "/dentix-booking-demo/" : "/",
    origin: target === "preview" ? "https://optidigitalagent.github.io" : "https://dentix.ua",
    outDir: `dist/${target}`,
  } as const;
}

export type PatientRoute = "home" | "price";

export function patientRoute(pathname: string, base: string): PatientRoute | null {
  if (pathname === base || pathname === `${base}index.html`) return "home";
  if (pathname === `${base}price.html`) return "price";
  return null;
}
