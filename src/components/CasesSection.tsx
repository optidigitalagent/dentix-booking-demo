import {
  casesDisclaimer,
  casesPublicationState,
  unclassifiedClinicalMedia,
} from "@/data/cases";
import { SectionHeading } from "./SectionHeading";

export function CasesSection() {
  const isDevelopment = import.meta.env.DEV;

  return (
    <section className="section cases" id="cases">
      <div className="wrap">
        <SectionHeading
          kicker="Клінічні кейси"
          title="Клінічні матеріали DENTIX"
          lede="Кейси з’являться після підтвердження групування, опису та дозволів на публікацію."
        />

        {isDevelopment ? (
          <div className="case-review-panel" role="status">
            <span className="case-review-kicker">Development preview</span>
            <h3>
              {unclassifiedClinicalMedia.length} клінічних файлів імпортовано
            </h3>
            <p>
              Зображення збережені як <code>unclassified</code> і не показуються
              як окремі кейси або «до / після».
            </p>
            <dl>
              <div>
                <dt>Статус</dt>
                <dd>{casesPublicationState.status}</dd>
              </div>
              <div>
                <dt>Публікація</dt>
                <dd>Заблокована</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <p className="cases-disclaimer">{casesDisclaimer}</p>
      </div>
    </section>
  );
}
