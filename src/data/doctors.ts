import albertPortrait from "@/assets/dentix-content/doctors/albert-podolyansky.webp";
import lauraPortrait from "@/assets/dentix-content/doctors/laura-hrysiak.webp";
import olenaPortrait from "@/assets/dentix-content/doctors/olena-hamaza.webp";

export type Doctor = {
  id: string;
  name: string;
  role: string;
  description?: string;
  photo: string;
  alt: string;
  objectPosition: string;
};

export const doctors: Doctor[] = [
  {
    id: "laura-hrysiak",
    name: "Грисяк Лаура Віталіївна",
    role: "Лікар-ортодонт, гнатолог",
    photo: lauraPortrait,
    alt: "Грисяк Лаура Віталіївна, лікар-ортодонт і гнатолог DENTIX",
    objectPosition: "center top",
  },
  {
    id: "albert-podolyansky",
    name: "Подолянский Альберт Альбертович",
    role: "Лікар-терапевт, ендодонтист, мікроскопіст",
    photo: albertPortrait,
    alt: "Подолянский Альберт Альбертович, лікар-терапевт, ендодонтист і мікроскопіст DENTIX",
    objectPosition: "center top",
  },
  {
    id: "olena-hamaza",
    name: "Гамаза Олена Анатоліївна",
    role: "Лікар-терапевт, гігієніст",
    photo: olenaPortrait,
    alt: "Гамаза Олена Анатоліївна, лікар-терапевт і гігієніст DENTIX",
    objectPosition: "center top",
  },
];
