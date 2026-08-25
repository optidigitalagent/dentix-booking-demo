import { useEffect, useRef, useState } from "react";
import { certificates } from "@/data/certificates";
import { Lightbox } from "./Lightbox";
import { SectionHeading } from "./SectionHeading";

export function CertificatesSection() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaX;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="section" id="certificates">
      <div className="wrap">
        <SectionHeading
          kicker="Сертифікати"
          title="Навчання та кваліфікація"
          lede="Демонстраційні сертифікати — замініть реальними документами лікарів DENTIX."
        />
        <div className="cert-wrap">
          <div className="cert-track" ref={trackRef}>
            {certificates.map((c, i) => (
              <button
                key={i}
                className="cert-card"
                onClick={() => setOpen(i)}
                aria-label={`Відкрити ${c.alt}`}
              >
                <img src={c.src} alt={c.alt} loading="lazy" />
              </button>
            ))}
          </div>
          <div className="cert-arrows">
            <button aria-label="Прокрутити ліворуч" onClick={() => scrollBy(-1)}>
              ‹
            </button>
            <button aria-label="Прокрутити праворуч" onClick={() => scrollBy(1)}>
              ›
            </button>
          </div>
          <p className="cert-hint">Гортайте вбік · натисніть, щоб збільшити</p>
        </div>
      </div>

      <Lightbox
        items={certificates.map((c) => ({ src: c.src, label: c.alt }))}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
