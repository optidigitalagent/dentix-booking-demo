import type { Doctor } from "./doctors";
import type { PriceBlock } from "./prices";

export type ImplantProstheticsRoute = "implantation" | "prosthetics";
type ImplantProstheticsPage = {
  path: string;
  label: string;
  title: string;
  description: string;
  h1: string;
  answer: string;
  scope: string[];
  priceNames: string[];
  related: (ImplantProstheticsRoute | "extraction")[];
  question: { q: string; a: string };
};

// Approved labels and bounded organizational copy only. Prices and people
// remain managed content. Expanded clinical copy requires professional review.
export const implantProstheticsPages: Record<ImplantProstheticsRoute, ImplantProstheticsPage> = {
  implantation: {
    path: "implantatsiya/",
    label: "Імплантація зубів",
    title: "Імплантація зубів у Дніпрі — послуга та ціни DENTIX",
    description: "Імплантація зубів у DENTIX у Дніпрі: окрема позиція поточного прайсу, консультація й контакти. Протезування на імплантах наведене окремо.",
    h1: "Імплантація зубів у Дніпрі",
    answer: "DENTIX у Дніпрі надає послугу імплантації зубів. У поточному прайсі є окрема позиція «Імплантація». Обсяг послуги й остаточну вартість підтверджує клініка після огляду та діагностики. Протезування на імплантах — окрема позиція прайсу, наведена на сторінці протезування.",
    scope: ["Імплантація"],
    priceNames: ["Консультація стоматолога", "Прицільний рентген", "Імплантація"],
    related: ["prosthetics", "extraction"],
    question: { q: "Де переглянути вартість протезування на імплантах?", a: "Ця послуга має окрему позицію прайсу на сторінці протезування. Посилання наведене нижче. Обсяг кожної послуги та остаточну вартість уточнюйте у клініці." },
  },
  prosthetics: {
    path: "protezirovanie/",
    label: "Протезування зубів",
    title: "Протезування зубів у Дніпрі — коронки та ціни DENTIX",
    description: "Протезування зубів у DENTIX у Дніпрі: металокерамічна й цирконієва коронки, мостоподібний протез і протезування на імплантах. Поточний прайс та контакти.",
    h1: "Протезування зубів у Дніпрі",
    answer: "У поточному прайсі DENTIX у Дніпрі наведені металокерамічна коронка, цирконієва коронка, мостоподібний протез і протезування на імплантах. Кожна послуга має окрему позицію. Обсяг послуг та остаточну вартість підтверджує клініка після огляду й діагностики.",
    scope: ["Металокерамічна коронка", "Цирконієва коронка", "Мостоподібний протез", "Протезування на імплантах"],
    priceNames: ["Консультація стоматолога", "Прицільний рентген", "Металокерамічна коронка", "Цирконієва коронка", "Мостоподібний протез", "Протезування на імплантах"],
    related: ["implantation"],
    question: { q: "Де переглянути вартість імплантації?", a: "Імплантація та протезування на імплантах — окремі позиції прайсу. Вартість імплантації наведена на окремій сторінці за посиланням нижче. Склад послуг індивідуального плану підтверджує клініка." },
  },
};

export function isImplantProstheticsRoute(route: string): route is ImplantProstheticsRoute {
  return Object.hasOwn(implantProstheticsPages, route);
}

export function selectImplantProstheticsDoctors(route: ImplantProstheticsRoute, doctors: Doctor[]) {
  // Exact visible tokens, including hyphen/comma forms. «ортодонт» and
  // inflected/related words cannot establish the approved «ортопед» role.
  const roleToken = route === "implantation"
    ? /(?:^|[^\p{L}\p{N}_])імплантолог(?=$|[^\p{L}\p{N}_])/u
    : /(?:^|[^\p{L}\p{N}_])ортопед(?=$|[^\p{L}\p{N}_])/u;
  return doctors.filter(({ role }) => roleToken.test(role));
}

export function selectImplantProstheticsPrices(route: ImplantProstheticsRoute, blocks: PriceBlock[]) {
  const names = new Set(implantProstheticsPages[route].priceNames);
  return blocks.flatMap((block) => block.rows.filter((row) => names.has(row.name)));
}
