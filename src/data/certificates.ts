import cert from "@/assets/certificate.jpg";

export type Certificate = { src: string; alt: string };

export const certificates: Certificate[] = Array.from({ length: 10 }, (_, i) => ({
  src: cert,
  alt: `Демонстраційний сертифікат лікаря DENTIX ${i + 1}`,
}));
