import type { Doctor } from "./doctors";
import type { PriceBlock } from "./prices";

export type SurgeryRoute = "surgery" | "extraction" | "wisdom";
type SurgeryPage = {
  path: string;
  label: string;
  title: string;
  description: string;
  h1: string;
  answer: string;
  scope: string[];
  priceNames: string[];
  related: SurgeryRoute[];
  question: { q: string; a: string };
};

// PR-04B approved service labels and organizational copy only. Expanded
// clinical copy requires qualified review before production. Managed content
// owns all prices and people; the approved fallback has no surgeon.
export const surgeryPages: Record<SurgeryRoute, SurgeryPage> = {
  surgery: {
    path: "khirurhichna-stomatolohiia/",
    label: "Хірургічна стоматологія",
    title: "Хірургічна стоматологія у Дніпрі — DENTIX",
    description: "Хірургічна стоматологія DENTIX у Дніпрі: видалення зуба, зуба мудрості та складне видалення ретинованого зуба. Актуальний прайс і контакти клініки.",
    h1: "Хірургічна стоматологія у Дніпрі",
    answer: "DENTIX у Дніпрі надає послуги видалення зуба, видалення зуба мудрості та складного видалення ретинованого зуба. Тут зібрані відповідні позиції поточного прайсу й контакти клініки для узгодження консультації.",
    scope: ["Видалення зуба", "Видалення зуба мудрості", "Складне видалення ретинованого зуба"],
    priceNames: ["Видалення зуба", "Видалення зуба мудрості", "Складне видалення ретинованого зуба"],
    related: ["extraction", "wisdom"],
    question: { q: "Де переглянути послуги з видалення зубів?", a: "Видалення зуба та складне видалення ретинованого зуба зібрані на спільній сторінці. Видалення зуба мудрості має окрему сторінку. Посилання наведені нижче." },
  },
  extraction: {
    path: "vydalennia-zuba/",
    label: "Видалення зуба",
    title: "Видалення зуба у Дніпрі — послуги та ціни DENTIX",
    description: "Видалення зуба та складне видалення ретинованого зуба у DENTIX у Дніпрі. Позиції прайсу, консультація й контакти для уточнення обсягу та остаточної вартості.",
    h1: "Видалення зуба у Дніпрі",
    answer: "У DENTIX у Дніпрі доступні видалення зуба та складне видалення ретинованого зуба. На цій сторінці — ці послуги й відповідні позиції прайсу. Індивідуальний план складають після огляду та діагностики; обсяг і остаточну вартість підтверджує клініка.",
    scope: ["Видалення зуба", "Складне видалення ретинованого зуба"],
    priceNames: ["Видалення зуба", "Складне видалення ретинованого зуба"],
    related: ["surgery", "wisdom"],
    question: { q: "Де знайти вартість складного видалення?", a: "У прайсі на цій сторінці є окрема позиція «Складне видалення ретинованого зуба». Обсяг послуги й остаточну вартість підтверджує клініка після огляду та діагностики." },
  },
  wisdom: {
    path: "vydalennia-zuba-mudrosti/",
    label: "Видалення зуба мудрості",
    title: "Видалення зуба мудрості у Дніпрі — DENTIX",
    description: "Видалення зуба мудрості у DENTIX у Дніпрі: поточний прайс, консультація та контакти клініки. Обсяг послуги й остаточну вартість уточнюйте у клініці.",
    h1: "Видалення зуба мудрості у Дніпрі",
    answer: "DENTIX у Дніпрі надає послугу видалення зуба мудрості. Тут наведена її позиція з поточного прайсу. Обсяг послуги, індивідуальний план та остаточну вартість підтверджує клініка після огляду й діагностики.",
    scope: ["Видалення зуба мудрості"],
    priceNames: ["Видалення зуба мудрості", "Складне видалення ретинованого зуба"],
    related: ["surgery", "extraction"],
    question: { q: "Як уточнити обсяг послуги та вартість?", a: "Зателефонуйте до DENTIX для узгодження консультації. У прайсі видалення зуба мудрості та складне видалення ретинованого зуба наведені окремими позиціями. Яка послуга входить до індивідуального плану, підтверджує клініка після огляду й діагностики." },
  },
};

export function isSurgeryRoute(route: string): route is SurgeryRoute {
  return Object.hasOwn(surgeryPages, route);
}

export function selectSurgeryDoctors(doctors: Doctor[]) {
  // Match the exact visible role token, including «Лікар-хірург» or a
  // comma-separated role. A related word such as «нейрохірург» is not enough.
  return doctors.filter(({ role }) => /(?:^|[^\p{L}\p{N}_])хірург(?=$|[^\p{L}\p{N}_])/u.test(role));
}

export function selectSurgeryPrices(route: SurgeryRoute, blocks: PriceBlock[]) {
  const names = new Set(["Консультація стоматолога", "Прицільний рентген", ...surgeryPages[route].priceNames]);
  return blocks.flatMap((block) => block.rows.filter((row) => names.has(row.name)));
}
