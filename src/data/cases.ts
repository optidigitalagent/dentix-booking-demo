import before from "@/assets/case-before.jpg";
import mid from "@/assets/case-mid.jpg";
import after from "@/assets/case-after.jpg";

export type CaseShot = { src: string; label: string };
export type ClinicalCase = { id: string; shots: CaseShot[] };

const pair = (id: string): ClinicalCase => ({
  id,
  shots: [
    { src: before, label: "До" },
    { src: after, label: "Після" },
  ],
});

const triple = (id: string): ClinicalCase => ({
  id,
  shots: [
    { src: before, label: "До" },
    { src: mid, label: "Проміжний етап" },
    { src: after, label: "Після" },
  ],
});

export const casesRowOne: ClinicalCase[] = [
  pair("case-01"),
  triple("case-03"),
  pair("case-05"),
  pair("case-07"),
];

export const casesRowTwo: ClinicalCase[] = [
  triple("case-02"),
  pair("case-04"),
  pair("case-06"),
  pair("case-08"),
];

export const casesDisclaimer =
  "Демонстраційні матеріали. Замінити реальними клінічними випадками DENTIX.";
