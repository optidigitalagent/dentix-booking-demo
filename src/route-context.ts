import { createContext, useContext } from "react";
import type { PatientRoute } from "./build-profile";

export const RouteContext = createContext<PatientRoute>("home");
export const usePatientRoute = () => useContext(RouteContext);
