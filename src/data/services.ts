export type Service = {
  num: string;
  title: string;
  text: string;
  linkLabel: string;
  href: string;
};

export const services: Service[] = [
  {
    num: "01",
    title: "Профілактика",
    text: "Проф. гігієна з Air-flow, косметична гігієна та відбілювання зубів.",
    linkLabel: "Відкрити прайс",
    href: "/price.html#profilaktyka",
  },
  {
    num: "02",
    title: "Пародонтологія",
    text: "Vector-терапія, підтримуючий курс і пародонтологічне лікування.",
    linkLabel: "Відкрити прайс",
    href: "/price.html#parodontologiya",
  },
  {
    num: "03",
    title: "Терапія",
    text: "Лікування карієсу, пряма реставрація та ендодонтичне лікування.",
    linkLabel: "Відкрити прайс",
    href: "/price.html#terapiya",
  },
  {
    num: "04",
    title: "Ортодонтія",
    text: "Лігатурні й самолігуючі брекет-системи та ортодонтичні апарати.",
    linkLabel: "Відкрити прайс",
    href: "/price.html#ortodontiya",
  },
  {
    num: "05",
    title: "Ортопедія",
    text: "Металокерамічні й цирконієві коронки та керамічні вініри.",
    linkLabel: "Відкрити прайс",
    href: "/price.html#ortopediya",
  },
  {
    num: "06",
    title: "Хірургія",
    text: "Видалення зубів і встановлення імпланта за опублікованим прайсом.",
    linkLabel: "Відкрити прайс",
    href: "/price.html#hirurgiya",
  },
];
