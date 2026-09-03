import diagnostics from "@/assets/dentix-content/about/diagnostics-consultation-01.webp";
import team01 from "@/assets/dentix-content/about/team-at-work-01.webp";
import team02 from "@/assets/dentix-content/about/team-at-work-02.webp";
import team03 from "@/assets/dentix-content/about/team-at-work-03.webp";
import team04 from "@/assets/dentix-content/about/team-at-work-04.webp";
import team07 from "@/assets/dentix-content/about/team-at-work-07.webp";
import drive104830 from "@/assets/dentix-content/about/drive-clinic-20240405-104830.webp";
import drive105042 from "@/assets/dentix-content/about/drive-clinic-20240405-105042.webp";
import drive105121 from "@/assets/dentix-content/about/drive-clinic-20240405-105121.webp";
import drive105232 from "@/assets/dentix-content/about/drive-clinic-20240405-105232.webp";
import drive121322 from "@/assets/dentix-content/about/drive-clinic-20240405-121322.webp";
import drive123240 from "@/assets/dentix-content/about/drive-clinic-20240405-123240.webp";

export type AboutSlide = {
  id: string;
  src: string;
  alt: string;
  objectPosition: string;
};

export const aboutSlides: AboutSlide[] = [
  {
    id: "diagnostics-consultation",
    src: diagnostics,
    alt: "Фахівець DENTIX переглядає стоматологічне зображення на екрані",
    objectPosition: "center center",
  },
  {
    id: "drive-workstation",
    src: drive104830,
    alt: "Фахівець DENTIX працює за комп’ютером у кабінеті",
    objectPosition: "center center",
  },
  {
    id: "drive-clinic-room",
    src: drive105042,
    alt: "Фахівець DENTIX у стоматологічному кабінеті з обладнанням",
    objectPosition: "center center",
  },
  {
    id: "drive-instruments",
    src: drive105121,
    alt: "Стоматологічні інструменти в руках фахівця DENTIX",
    objectPosition: "center center",
  },
  {
    id: "drive-monitor",
    src: drive105232,
    alt: "Фахівець DENTIX біля монітора зі стоматологічними зображеннями",
    objectPosition: "center 38%",
  },
  {
    id: "drive-patient-room",
    src: drive121322,
    alt: "Фахівець DENTIX готує інструменти біля стоматологічного крісла",
    objectPosition: "center center",
  },
  {
    id: "drive-reception",
    src: drive123240,
    alt: "Фахівець DENTIX у зоні рецепції з логотипом клініки",
    objectPosition: "center 40%",
  },
  {
    id: "team-at-work-01",
    src: team01,
    alt: "Фахівчиня DENTIX під час роботи в стоматологічному кабінеті",
    objectPosition: "center center",
  },
  {
    id: "team-at-work-02",
    src: team02,
    alt: "Фахівчиня DENTIX працює з пацієнтом у стоматологічному кабінеті",
    objectPosition: "center center",
  },
  {
    id: "team-at-work-03",
    src: team03,
    alt: "Двоє фахівців DENTIX під час роботи з пацієнтом",
    objectPosition: "center center",
  },
  {
    id: "team-at-work-04",
    src: team04,
    alt: "Фахівець DENTIX працює з пацієнтом біля стоматологічного крісла",
    objectPosition: "center center",
  },
  {
    id: "team-at-work-07",
    src: team07,
    alt: "Робочий процес DENTIX у стоматологічному кабінеті",
    objectPosition: "center center",
  },
];

const heroSlideIds = new Set([
  "team-at-work-02",
  "team-at-work-03",
  "team-at-work-04",
  "team-at-work-07",
]);

export const heroSlides = aboutSlides.filter((slide) => heroSlideIds.has(slide.id));
