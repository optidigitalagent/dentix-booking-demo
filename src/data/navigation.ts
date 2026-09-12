import { site } from "./site";

export const patientNavigation = [
  { label: "Головна", to: "/" },
  ...site.nav.filter((item) => item.to !== "/#contact-info"),
  { label: "Лікарі", to: "/likari/" },
  { label: "Контакти", to: "/kontakty/" },
];
