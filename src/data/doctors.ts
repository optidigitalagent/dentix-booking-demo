import doc1 from "@/assets/doctor-1.jpg";
import doc2 from "@/assets/doctor-2.jpg";
import doc3 from "@/assets/doctor-3.jpg";

export type Doctor = { name: string; role: string; photo: string };

export const doctors: Doctor[] = [
  { name: "Лікарка DENTIX", role: "Лікарка-ортодонт", photo: doc1 },
  { name: "Лікар DENTIX", role: "Лікар-ортодонт", photo: doc2 },
  { name: "Лікарка DENTIX", role: "Стоматолог-ортопед", photo: doc3 },
];
