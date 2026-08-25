export type PriceRow = { name: string; cost: string };
export type PriceBlock = {
  id: string;
  num: string | null;
  kicker: string;
  title: string;
  rows: PriceRow[];
  note?: string;
  link?: { label: string; href: string };
};

export const priceBlocks: PriceBlock[] = [
  {
    id: "zagalni",
    num: null,
    kicker: "Загальні",
    title: "Консультація та діагностика",
    rows: [
      { name: "Консультація", cost: "Ціна буде додана" },
      { name: "Дентальний знімок", cost: "Ціна буде додана" },
    ],
  },
  {
    id: "profilaktyka",
    num: "01",
    kicker: "Профілактика",
    title: "Профілактичні процедури",
    rows: [
      { name: "Професійна гігієна з використанням Air-flow", cost: "Ціна буде додана" },
      { name: "Косметична гігієна", cost: "Ціна буде додана" },
      { name: "Відбілювання зубів", cost: "Ціна буде додана" },
    ],
  },
  {
    id: "parodontologiya",
    num: "02",
    kicker: "Пародонтологія",
    title: "Пародонтологічне лікування",
    rows: [
      { name: "Vector-терапія", cost: "Ціна буде додана" },
      { name: "Підтримуючий курс Vector-терапії", cost: "Ціна буде додана" },
      { name: "Пародонтологічне лікування", cost: "Ціна буде додана" },
    ],
  },
  {
    id: "terapiya",
    num: "03",
    kicker: "Терапія",
    title: "Терапія",
    rows: [
      { name: "Консультація", cost: "Ціна буде додана" },
      { name: "Лікування карієсу", cost: "Ціна буде додана" },
      { name: "Лікування каналів", cost: "Ціна буде додана" },
      { name: "Пряма реставрація зубів", cost: "Ціна буде додана" },
    ],
  },
  {
    id: "ortodontiya",
    num: "04",
    kicker: "Ортодонтія",
    title: "Ортодонтичне лікування",
    rows: [
      { name: "Консультація ортодонта", cost: "Ціна буде додана" },
      { name: "Зняття відбитків та складання плану лікування", cost: "Ціна буде додана" },
      { name: "Брекет-система", cost: "Ціна буде додана" },
      { name: "Ортодонтичний апарат", cost: "Ціна буде додана" },
    ],
    note: "Повну вартість індивідуального плану визначають після діагностики.",
  },
  {
    id: "ortopediya",
    num: "05",
    kicker: "Ортопедія",
    title: "Ортопедична стоматологія",
    rows: [
      { name: "Коронка", cost: "Ціна буде додана" },
      { name: "Вінір", cost: "Ціна буде додана" },
    ],
  },
  {
    id: "hirurgiya",
    num: "06",
    kicker: "Хірургія",
    title: "Хірургічна стоматологія",
    rows: [
      { name: "Видалення зуба", cost: "Ціна буде додана" },
      { name: "Встановлення імпланта", cost: "Ціна буде додана" },
    ],
  },
];
