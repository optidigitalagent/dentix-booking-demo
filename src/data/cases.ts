export type ClinicalCaseImage = {
  src: string;
  stage: "before" | "process" | "after" | "unclassified";
};

export type ClinicalCase = {
  id: string;
  title: string;
  procedure: string | null;
  doctorId: string | null;
  images: ClinicalCaseImage[];
  publicationApproved: boolean;
};

export type UnclassifiedClinicalMedia = {
  id: string;
  repositoryPath: string;
  stage: "unclassified";
  publicationApproved: false;
};

const unclassifiedIds = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "08",
  "09",
  "10",
  "11",
  "12",
];

export const unclassifiedClinicalMedia: UnclassifiedClinicalMedia[] =
  unclassifiedIds.map((id) => ({
    id: `clinical-unclassified-${id}`,
    repositoryPath: `src/assets/dentix-content/cases/unclassified/clinical-${id}-web.webp`,
    stage: "unclassified",
    publicationApproved: false,
  }));

// No image is promoted to a case until grouping, order, medical copy and consent are confirmed.
export const clinicalCases: ClinicalCase[] = [];

export const casesPublicationState = {
  status: "NEEDS_CASE_MAPPING",
  publicationApproved: false,
  rejectedAssetId: "clinical-unclassified-07",
} as const;

export const casesDisclaimer =
  "Клінічні матеріали не опубліковані: опис, порядок фото та дозвіл на публікацію очікують підтвердження.";
