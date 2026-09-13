import type { Doctor } from "./doctors";
import type { PriceBlock } from "./prices";

export type TherapyRoute = "therapy" | "caries" | "microscope";
export type TherapyPage = {
  path: string;
  label: string;
  title: string;
  description: string;
  h1: string;
  answer: string;
  scope: string[];
  priceNames: string[];
  related: TherapyRoute[];
  question: { q: string; a: string };
};

// PR-04A approved service/operational copy. Clinical explanations need a
// qualified review before production. Values and people live in managed content.
export const therapyPages: Record<TherapyRoute, TherapyPage> = {
  therapy: {
    path: "terapevtychna-stomatolohiia/",
    label: "Терапевтична стоматологія",
    title: "Терапевтична стоматологія у Дніпрі — DENTIX",
    description: "Терапевтична стоматологія DENTIX у Дніпрі: карієс, реставрація, лікування каналів і під мікроскопом. Лікарі, актуальний прайс та узгодження прийому телефоном.",
    h1: "Терапевтична стоматологія у Дніпрі",
    answer: "У DENTIX у Дніпрі напрямок терапії охоплює лікування карієсу, пряму та художню реставрацію, ендодонтичне лікування — лікування каналів, зокрема під мікроскопом.",
    scope: ["Лікування карієсу", "Пряма та художня реставрація", "Ендодонтичне лікування — лікування каналів", "Лікування під мікроскопом"],
    priceNames: ["Лікування карієсу", "Художня реставрація", "Лікування каналів", "Лікування під мікроскопом", "Перелікування кореневих каналів під мікроскопом"],
    related: ["caries", "microscope"],
    question: { q: "Де переглянути послуги терапевтичного напрямку?", a: "Карієс і реставрація мають окрему сторінку. Лікування каналів, лікування під мікроскопом і перелікування кореневих каналів під мікроскопом зібрані на спільній сторінці. Посилання на них наведені нижче." },
  },
  caries: {
    path: "likuvannia-kariiesu/",
    label: "Лікування карієсу",
    title: "Лікування карієсу у Дніпрі — DENTIX",
    description: "Лікування карієсу та художня реставрація у DENTIX у Дніпрі. Перегляньте лікарів-терапевтів і прайс; індивідуальний план та остаточну вартість підтверджує клініка.",
    h1: "Лікування карієсу у Дніпрі",
    answer: "DENTIX у Дніпрі надає послуги лікування карієсу та художньої реставрації. На цій сторінці — відповідні позиції прайсу й лікарі-терапевти клініки. Індивідуальний план складають після огляду та діагностики.",
    scope: ["Лікування карієсу", "Художня реставрація"],
    priceNames: ["Лікування карієсу", "Художня реставрація"],
    related: ["therapy", "microscope"],
    question: { q: "Де знайти вартість лікування карієсу та реставрації?", a: "Обидві послуги наведені окремими рядками в прайсі на цій сторінці. Остаточну вартість і склад індивідуального плану підтверджує клініка після огляду та діагностики." },
  },
  microscope: {
    path: "lechenie-pod-mikroskopom/",
    label: "Лікування під мікроскопом",
    title: "Лікування каналів під мікроскопом у Дніпрі — DENTIX",
    description: "Лікування каналів, лікування та перелікування під мікроскопом у DENTIX у Дніпрі. Ендодонтист, мікроскопіст, актуальний прайс та контакти клініки.",
    h1: "Лікування каналів під мікроскопом у Дніпрі",
    answer: "У DENTIX у Дніпрі доступні лікування каналів, лікування під мікроскопом і перелікування кореневих каналів під мікроскопом. Тут зібрані ці послуги, їхні позиції прайсу та лікар із роллю ендодонтиста й мікроскопіста.",
    scope: ["Лікування каналів", "Лікування під мікроскопом", "Перелікування кореневих каналів під мікроскопом"],
    priceNames: ["Лікування каналів", "Лікування під мікроскопом", "Перелікування кореневих каналів під мікроскопом"],
    related: ["therapy", "caries"],
    question: { q: "Як уточнити вартість перелікування каналів під мікроскопом?", a: "Зверніться до клініки телефоном для узгодження прийому. Остаточний обсяг перелікування кореневих каналів під мікроскопом та вартість підтверджує клініка після огляду й діагностики." },
  },
};

export function isTherapyRoute(route: string): route is TherapyRoute {
  return Object.hasOwn(therapyPages, route);
}

export function selectTherapyDoctors(route: TherapyRoute, doctors: Doctor[]) {
  return doctors.filter(({ role }) => route === "microscope"
    ? role.includes("ендодонтист") && role.includes("мікроскопіст")
    : role.includes("Лікар-терапевт"));
}

export function selectTherapyPrices(route: TherapyRoute, blocks: PriceBlock[]) {
  const names = new Set(["Консультація стоматолога", "Прицільний рентген", ...therapyPages[route].priceNames]);
  // Only the supplied managed snapshot: never backfill a missing runtime row
  // from a second dataset or infer a price from a similar service name.
  return blocks.flatMap((block) => block.rows.filter((row) => names.has(row.name)));
}
