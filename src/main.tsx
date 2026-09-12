import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { PatientApp } from "./PatientApp";
import { patientRoute } from "./build-profile";
import "./patient.css";

const root = document.getElementById("root");

if (!root) throw new Error("Root element was not found");

const route = patientRoute(window.location.pathname, import.meta.env.BASE_URL);
document.body.dataset.demoSurface = "patient";
if (route) {
  const app = <StrictMode><PatientApp route={route} /></StrictMode>;
  if (root.dataset.prerendered === "true") hydrateRoot(root, app);
  else createRoot(root).render(app);
} else {
  // Defensive fallback for a misconfigured SPA host. Static hosting must return 404.
  document.title = "Сторінку не знайдено — DENTIX";
  document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex,nofollow,noarchive");
  document.querySelectorAll('link[rel="canonical"], script[type="application/ld+json"]').forEach((node) => node.remove());
  createRoot(root).render(<main><h1>Сторінку не знайдено</h1><a href={import.meta.env.BASE_URL}>На головну DENTIX</a></main>);
}
