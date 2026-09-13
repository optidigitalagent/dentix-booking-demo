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

export type PatientRoute = "home" | "price" | "doctors" | "contacts" | "therapy" | "caries" | "microscope" | "surgery" | "extraction" | "wisdom" | "implantation" | "prosthetics";

export function patientRoute(pathname: string, base: string): PatientRoute | null {
  if (pathname === base || pathname === `${base}index.html`) return "home";
  if (pathname === `${base}price.html`) return "price";
  if (pathname === `${base}likari/` || pathname === `${base}likari/index.html`) return "doctors";
  if (pathname === `${base}kontakty/` || pathname === `${base}kontakty/index.html`) return "contacts";
  if (pathname === `${base}terapevtychna-stomatolohiia/` || pathname === `${base}terapevtychna-stomatolohiia/index.html`) return "therapy";
  if (pathname === `${base}likuvannia-kariiesu/` || pathname === `${base}likuvannia-kariiesu/index.html`) return "caries";
  if (pathname === `${base}lechenie-pod-mikroskopom/` || pathname === `${base}lechenie-pod-mikroskopom/index.html`) return "microscope";
  if (pathname === `${base}khirurhichna-stomatolohiia/` || pathname === `${base}khirurhichna-stomatolohiia/index.html`) return "surgery";
  if (pathname === `${base}vydalennia-zuba/` || pathname === `${base}vydalennia-zuba/index.html`) return "extraction";
  if (pathname === `${base}vydalennia-zuba-mudrosti/` || pathname === `${base}vydalennia-zuba-mudrosti/index.html`) return "wisdom";
  if (pathname === `${base}implantatsiya/` || pathname === `${base}implantatsiya/index.html`) return "implantation";
  if (pathname === `${base}protezirovanie/` || pathname === `${base}protezirovanie/index.html`) return "prosthetics";
  return null;
}
