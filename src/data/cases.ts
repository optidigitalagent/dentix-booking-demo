import clinical01 from "@/assets/dentix-content/cases/unclassified/clinical-01-web.webp";
import clinical02 from "@/assets/dentix-content/cases/unclassified/clinical-02-web.webp";
import clinical03 from "@/assets/dentix-content/cases/unclassified/clinical-03-web.webp";
import clinical04 from "@/assets/dentix-content/cases/unclassified/clinical-04-web.webp";
import clinical05 from "@/assets/dentix-content/cases/unclassified/clinical-05-web.webp";
import clinical06 from "@/assets/dentix-content/cases/unclassified/clinical-06-web.webp";
import clinical08 from "@/assets/dentix-content/cases/unclassified/clinical-08-web.webp";
import clinical09 from "@/assets/dentix-content/cases/unclassified/clinical-09-web.webp";
import clinical10 from "@/assets/dentix-content/cases/unclassified/clinical-10-web.webp";
import clinical11 from "@/assets/dentix-content/cases/unclassified/clinical-11-web.webp";
import clinical12 from "@/assets/dentix-content/cases/unclassified/clinical-12-web.webp";

export type ClinicalMedia = {
  id: string;
  src: string;
  alt: string;
};

export const clinicalMedia: ClinicalMedia[] = [
  clinical01,
  clinical02,
  clinical03,
  clinical04,
  clinical05,
  clinical06,
  clinical08,
  clinical09,
  clinical10,
  clinical11,
  clinical12,
].map((src, index) => ({
  id: `clinical-material-${String(index + 1).padStart(2, "0")}`,
  src,
  alt: `Документальний клінічний матеріал DENTIX — зображення ${index + 1}`,
}));

export const casesPublicationState = {
  status: "PUBLISHED_WITHOUT_MEDICAL_CLAIMS",
  publicationApproved: true,
  rejectedAssetId: "clinical-unclassified-07",
  rejectedReason: "blurred",
} as const;

export const casesDisclaimer =
  "Кожне зображення показано як окремий переданий матеріал. Пари «до / після», діагнози, процедури та результати не позначені без підтвердженого зіставлення.";
