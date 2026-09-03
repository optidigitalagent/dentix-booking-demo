import { useManagedContent } from "@/hooks/use-managed-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { BookingButton } from "./booking/BookingContext";

export function TeamSection() {
  const { doctors, doctorsSource } = useManagedContent();

  return (
    <section className="section" id="team" data-content-source={doctorsSource}>
      <div className="wrap">
        <SectionHeading
          kicker="Команда"
          title="Лікарі DENTIX"
          lede="Прийом ведуть лікарі клініки за відповідними напрямками лікування."
        />
        <div className="team-grid">
          {doctors.map((d, i) => (
            <Reveal as="article" key={d.id} className="doc" delay={i * 80}>
              <div className="doc-ring">
                <img
                  className="doc-avatar"
                  src={d.photo}
                  alt={d.alt}
                  width={960}
                  height={1280}
                  loading="lazy"
                  style={{ objectPosition: d.objectPosition }}
                />
              </div>
              <div className="doc-copy">
                <h3>{d.name}</h3>
                <p className="doc-role">{d.role}</p>
                {d.description ? <p className="doc-description">{d.description}</p> : null}
                <BookingButton className="doc-booking">
                  Обрати лікаря
                </BookingButton>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
