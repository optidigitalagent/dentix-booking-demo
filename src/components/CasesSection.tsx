import { useState } from "react";
import { casesDisclaimer, clinicalMedia } from "@/data/cases";
import { Lightbox } from "./Lightbox";
import { MotionMarquee } from "./MotionMarquee";
import { SectionHeading } from "./SectionHeading";

export function CasesSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section cases" id="cases">
      <div className="wrap">
        <SectionHeading
          kicker="Кейси"
          title="Клінічні випадки"
          lede="Реальні документальні матеріали DENTIX без доданих діагнозів, процедур або непідтверджених результатів."
        />
      </div>

      <MotionMarquee
        items={clinicalMedia}
        ariaLabel="Клінічні матеріали DENTIX"
        className="cases-motion"
        getKey={(item) => item.id}
        renderItem={(item, index, duplicate) => (
          <button
            type="button"
            className="case-motion-card"
            onClick={() => setOpen(index)}
            aria-label={duplicate ? undefined : `Відкрити клінічний матеріал ${index + 1}`}
            tabIndex={duplicate ? -1 : undefined}
          >
            <img src={item.src} alt={duplicate ? "" : item.alt} loading="lazy" decoding="async" />
          </button>
        )}
      />

      <div className="wrap">
        <p className="cases-disclaimer">{casesDisclaimer}</p>
      </div>

      <Lightbox
        items={clinicalMedia.map((item) => ({ src: item.src, label: item.alt }))}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
