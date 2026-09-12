import { PatientDemo } from "./PatientDemo";
import { PriceDemo } from "./PriceDemo";
import type { PatientRoute } from "./build-profile";
import { RouteContext } from "./route-context";

export function PatientApp({ route }: { route: PatientRoute }) {
  return (
    <RouteContext.Provider value={route}>
      {route === "price" ? <PriceDemo /> : <PatientDemo />}
    </RouteContext.Provider>
  );
}
