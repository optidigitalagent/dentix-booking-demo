import { useState } from "react";
import { casesRowOne, casesRowTwo, casesDisclaimer, type CaseShot } from "@/data/cases";
import { Lightbox } from "./Lightbox";
import { SectionHeading } from "./SectionHeading";

const rows = [casesRowOne, casesRowTwo];
const allShots: CaseShot[] = rows.flat().flatMap((c) => c.shots);

export function CasesSection() {
  const [open, setOpen] = useState<number | null>(null);
  let counter = -1;

  return (
    <section className="section cases" id="cases">
      <div className="wrap">
        <SectionHeading
          kicker="Клінічні кейси"
          title="Результати лікування"
          lede="Приклади робіт у форматі «до / проміжний етап / після»."
        />

        {rows.map((row, r) => (
          <div className="case-track" key={r}>
            {row.map((c) => (
              <article className="case-card" key={c.id}>
                <div className={`case-sequence${c.shots.length > 2 ? " triple" : ""}`}>
                  {c.shots.map((s) => {
                    counter += 1;
                    const idx = counter;
                    return (
                      <button
                        className="case-shot"
                        key={`${c.id}-${s.label}`}
                        onClick={() => setOpen(idx)}
                        aria-label={`${s.label} — збільшити`}
                      >
                        <img src={s.src} alt={`Клінічний випадок ${c.id}: ${s.label}`} loading="lazy" />
                        <span className="case-ribbon">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        ))}

        <p className="cases-disclaimer">{casesDisclaimer}</p>
      </div>

      <Lightbox
        items={allShots.map((s) => ({ src: s.src, label: s.label }))}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
