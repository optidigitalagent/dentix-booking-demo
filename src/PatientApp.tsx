import { EntityPage } from "./EntityPage";
import { EntitySchema } from "./components/EntitySchema";
import { PatientDemo } from "./PatientDemo";
import { PriceDemo } from "./PriceDemo";
import type { PatientRoute } from "./build-profile";
import { RouteContext } from "./route-context";

export function PatientApp({ route }: { route: PatientRoute }) {
  return (
    <RouteContext.Provider value={route}>
      <EntitySchema route={route} />
      {route === "price" ? <PriceDemo /> : route === "home" ? <PatientDemo /> : <EntityPage route={route} />}
    </RouteContext.Provider>
  );
}
