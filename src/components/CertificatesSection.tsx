import { useState } from "react";
import { certificates } from "@/data/certificates";
import { Lightbox } from "./Lightbox";
import { MotionMarquee } from "./MotionMarquee";
import { SectionHeading } from "./SectionHeading";

export function CertificatesSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section certificates-section" id="certificates">
      <div className="wrap">
        <SectionHeading
          kicker="Сертифікати"
          title="Навчання та кваліфікація"
          lede="Сертифікати та професійне навчання команди DENTIX. Натисніть документ, щоб роздивитися його повністю."
        />
      </div>

      <MotionMarquee
        items={certificates}
        ariaLabel="Сертифікати DENTIX"
        className="certificates-motion"
        getKey={(item) => item.id}
        renderItem={(item, index, duplicate) => (
          <button
            type="button"
            className="certificate-motion-card"
            onClick={() => setOpen(index)}
            aria-label={duplicate ? undefined : `Відкрити ${item.alt}`}
            tabIndex={duplicate ? -1 : undefined}
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
          >
            <img
              src={item.src}
              alt={duplicate ? "" : item.alt}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
            />
          </button>
        )}
      />

      <Lightbox
        items={certificates.map((item) => ({ src: item.src, label: item.alt }))}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
