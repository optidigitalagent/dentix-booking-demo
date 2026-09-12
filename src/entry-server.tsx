import { renderToString } from "react-dom/server";
import { PatientApp } from "./PatientApp";
import type { PatientRoute } from "./build-profile";

// Effects (including content/readiness requests) never run during this render.
export function render(route: PatientRoute) {
  return renderToString(<PatientApp route={route} />);
}
