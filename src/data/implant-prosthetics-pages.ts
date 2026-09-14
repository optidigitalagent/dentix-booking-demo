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
    description: "Імплантація у DENTIX у Дніпрі: імплант, цирконієва коронка на імпланті та All-on-4 (Корея). Поточний прайс, консультація й контакти.",
    h1: "Імплантація зубів у Дніпрі",
    answer: "У прайсі DENTIX у Дніпрі наведені імплант, цирконієва коронка на імпланті та імплантація All-on-4 (Корея). Для All-on-4 у вартість входять імпланти та протезування на імплантах. Обсяг інших послуг та остаточну вартість підтверджує клініка після огляду й діагностики.",
    scope: ["Імплант", "Цирконієва коронка на імпланті", "Імплантація All-on-4 (Корея)"],
    priceNames: ["Консультація стоматолога", "Прицільний рентген", "Імплант", "Цирконієва коронка на імпланті", "Імплантація All-on-4 (Корея)"],
    related: ["prosthetics", "extraction"],
    question: { q: "Де переглянути вартість протезування на імплантах?", a: "Цирконієва коронка на імпланті та All-on-4 (Корея) наведені в розділі імплантації поточного прайсу й у таблиці на цій сторінці." },
  },
  prosthetics: {
    path: "protezirovanie/",
    label: "Протезування зубів",
    title: "Протезування зубів у Дніпрі — коронки та ціни DENTIX",
    description: "Протезування зубів у DENTIX у Дніпрі: металокерамічна й цирконієва коронки та мостоподібний протез. Поточний прайс та контакти.",
    h1: "Протезування зубів у Дніпрі",
    answer: "У поточному прайсі DENTIX у Дніпрі наведені металокерамічна коронка, цирконієва коронка та мостоподібний протез. Кожна послуга має окрему позицію. Протезування на імплантах наведене в розділі імплантації. Обсяг послуг та остаточну вартість підтверджує клініка після огляду й діагностики.",
    scope: ["Металокерамічна коронка", "Цирконієва коронка", "Мостоподібний протез"],
    priceNames: ["Консультація стоматолога", "Прицільний рентген", "Металокерамічна коронка", "Цирконієва коронка", "Мостоподібний протез"],
    related: ["implantation"],
    question: { q: "Де переглянути вартість імплантації?", a: "Імплант, цирконієва коронка на імпланті та All-on-4 (Корея) наведені в розділі імплантації. Перейдіть за посиланням нижче, щоб переглянути поточні ціни та склад вартості." },
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
