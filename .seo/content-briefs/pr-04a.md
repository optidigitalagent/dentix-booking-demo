# PR-04A therapy cluster — implementation and content boundary

Dated 2026-09-13. Query Lock Priority 1; Ukrainian publication only. Research dated 2026-09-12 is fresh for this implementation. Russian queries remain research-only.

| Route | Patient purpose | Approved scope | Current doctor selection |
|---|---|---|---|
| /terapevtychna-stomatolohiia/ | Therapy hub and service/clinician selection | Caries, direct/artistic restoration, endodontics/canals, microscope | Exact current role contains Лікар-терапевт |
| /likuvannia-kariiesu/ | Caries/restoration decision | Caries and artistic restoration only | Exact current role contains Лікар-терапевт |
| /lechenie-pod-mikroskopom/ | Consolidated canals/endodontics/microscope | Canal treatment, microscope treatment, root-canal retreatment under microscope | Current role contains both ендодонтист and мікроскопіст |

The legacy microscope URL is preserved. No /likuvannia-kanaliv/ or PR04B/C routes. Existing migration dispositions remain unchanged; only the microscope local implementation status is reconciled.

APPROVED_CURRENT_FACT: current service labels (F-025), roles (F-018/F-019), contact facts (F-012–F-016/F-021), exact shared prices (F-022), and examination/diagnostics/individual-plan/clinic-confirmed cost statements (F-023/F-026). PR04A pack source pins verified against base 51e1da2343923d5e997d8bb6d7abe6734b9bc24c; no drift.

NEW_BOUNDED_OPERATIONAL_COPY: page introductions, navigation, scoped lists, operational sequence, and contact/price questions. Source files: src/data/therapy-pages.ts and src/TherapyPage.tsx. Questions are editorial decision/contact prompts from the approved brief and confirmed demand; not claimed to be recorded patient quotations.

PROFESSIONAL_REVIEW_REQUIRED_BEFORE_PRODUCTION: any clinical explanation beyond the approved current sources. No such explanation is added. Named qualified reviewer UNKNOWN; medical review NOT_COMPLETED. This permits a noindex preview and local production artifact for Draft review; production launch remains separately blocked. No doctor byline or invented review.

No symptoms, stage classifications, materials, anaesthesia methods, procedure duration/visit counts, diagnoses, eligibility/contraindications, microscope model, clinical outcomes, guarantees, ratings, credentials, or unclassified cases. Legacy WordPress prices/copy do not override current approved sources.

Single managed source: useManagedContent doctors/priceBlocks, existing loader normalization and section fallback. Price selection uses exact row names and returns current row objects without copied values. A valid partial runtime snapshot never silently restores removed rows from fallback. Missing matching rows/roles produce clinic-contact text. SSR uses local fallback with no fetch; hydration refreshes visible cards and matching production Person nodes.

Fallback expected: therapy/caries show Подолянский Альберт Альбертович and Гамаза Олена Анатоліївна; microscope shows Подолянский Альберт Альбертович, using unchanged names/roles from src/data/doctors.ts. Fallback amounts remain exclusively src/data/prices.ts.

Home therapy card, therapy price block and role-contextual doctor links lead into the cluster; every service page links doctors, contacts, shared price and related therapy pages. One H1, direct Ukrainian answer, phone CTA, existing fail-closed booking controls, operational sequence and visible questions. Existing design system and SiteLayout retained.

Production-only WebSite/WebPage/Dentist/Service/visible Person/BreadcrumbList with stable IDs; supporting PostalAddress/OpeningHoursSpecification/ListItem. Service name/description exactly match visible H1/answer; provider references DENTIX. No price/Offer/FAQPage/Review/MedicalProcedure inference. No rich-result or citation promise. Primary references checked 2026-09-13: https://schema.org/Service and https://developers.google.com/search/docs/appearance/structured-data/sd-policies.

Seven local production canonical/sitemap URLs: /, /likari/, /kontakty/, /price.html and the three routes above. Preview: exact noindex,nofollow,noarchive; no canonical, sitemap or production graph. Real directory artifacts/HTTP 200, missing routes and production admin 404; preview admin isolated.

Fresh QA receipts are in external DENTIX_PR04A_THERAPY_EVIDENCE_2026-09-13. No form submission/appointment or account/production mutation. GSC/GBP/GA4/GTM/Bing ACCESS_BLOCKED; T0 NOT_READY; React production NOT_LAUNCHED; outcome_report.claims=[].
