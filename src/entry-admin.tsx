import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminCrm } from "./admin/AdminCrm";
import "./admin.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element was not found");
document.body.dataset.demoSurface = "admin";
createRoot(root).render(<StrictMode><AdminCrm /></StrictMode>);
