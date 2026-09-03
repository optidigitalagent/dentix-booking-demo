import certificate01 from "@/assets/dentix-content/certificates/web/certificate-01.webp";
import certificate02 from "@/assets/dentix-content/certificates/web/certificate-02.webp";
import certificate03 from "@/assets/dentix-content/certificates/web/certificate-03.webp";
import certificate04 from "@/assets/dentix-content/certificates/web/certificate-04.webp";
import certificate05 from "@/assets/dentix-content/certificates/web/certificate-05.webp";
import certificate06 from "@/assets/dentix-content/certificates/web/certificate-06.webp";
import certificate07 from "@/assets/dentix-content/certificates/web/certificate-07.webp";
import certificate08 from "@/assets/dentix-content/certificates/web/certificate-08.webp";
import certificate09 from "@/assets/dentix-content/certificates/web/certificate-09.webp";
import certificate10 from "@/assets/dentix-content/certificates/web/certificate-10.webp";

export type Certificate = { id: string; src: string; alt: string };

export const certificates: Certificate[] = [
  certificate01,
  certificate02,
  certificate03,
  certificate04,
  certificate05,
  certificate06,
  certificate07,
  certificate08,
  certificate09,
  certificate10,
].map((src, index) => ({
  id: `certificate-${String(index + 1).padStart(2, "0")}`,
  src,
  alt: `Сертифікат про професійне навчання команди DENTIX — документ ${index + 1}`,
}));
