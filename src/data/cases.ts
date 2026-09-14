import clinical02 from "@/assets/dentix-content/cases/unclassified/clinical-02-web.webp";
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

// Preserve the originally published IDs and captions when removing gallery entries.
export const clinicalMedia: ClinicalMedia[] = [
  {
    id: "clinical-material-02",
    src: clinical02,
    alt: "Документальний клінічний матеріал DENTIX — зображення 2",
  },
  {
    id: "clinical-material-06",
    src: clinical06,
    alt: "Документальний клінічний матеріал DENTIX — зображення 6",
  },
  {
    id: "clinical-material-07",
    src: clinical08,
    alt: "Документальний клінічний матеріал DENTIX — зображення 7",
  },
  {
    id: "clinical-material-08",
    src: clinical09,
    alt: "Документальний клінічний матеріал DENTIX — зображення 8",
  },
  {
    id: "clinical-material-09",
    src: clinical10,
    alt: "Документальний клінічний матеріал DENTIX — зображення 9",
  },
  {
    id: "clinical-material-10",
    src: clinical11,
    alt: "Документальний клінічний матеріал DENTIX — зображення 10",
  },
  {
    id: "clinical-material-11",
    src: clinical12,
    alt: "Документальний клінічний матеріал DENTIX — зображення 11",
  },
];

export const casesPublicationState = {
  status: "PUBLISHED_WITHOUT_MEDICAL_CLAIMS",
  publicationApproved: true,
  rejectedAssetId: "clinical-unclassified-07",
  rejectedReason: "blurred",
} as const;

export const casesDisclaimer =
  "Кожне зображення показано як окремий переданий матеріал. Пари «до / після», діагнози, процедури та результати не позначені без підтвердженого зіставлення.";
