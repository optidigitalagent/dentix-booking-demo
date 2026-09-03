import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminCrm } from "@/admin/AdminCrm";
import { PatientDemo } from "@/PatientDemo";
import { PriceDemo } from "@/PriceDemo";
import "./patient.css";
import "./admin.css";

const root = document.getElementById("root");

if (!root) throw new Error("Root element was not found");

const isAdmin = /\/admin\/?$/.test(window.location.pathname);
const isPrice = /\/price\.html\/?$/.test(window.location.pathname);

document.documentElement.lang = isAdmin ? "uk" : "uk";
document.body.dataset.demoSurface = isAdmin ? "admin" : "patient";
document.title = isAdmin
  ? "DENTIX — Admin CRM demo"
  : isPrice
    ? "Ціни на стоматологічні послуги — DENTIX"
    : "DENTIX — patient booking demo";

createRoot(root).render(
  <StrictMode>{isAdmin ? <AdminCrm /> : isPrice ? <PriceDemo /> : <PatientDemo />}</StrictMode>,
);
