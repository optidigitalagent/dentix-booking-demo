import { doctors } from "@/data/doctors";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { BookingButton } from "./booking/BookingContext";

export function TeamSection() {
  return (
    <section className="section" id="team">
      <div className="wrap">
        <SectionHeading
          kicker="Команда"
          title="Лікарі DENTIX"
          lede="Прийом ведуть лікарі клініки за відповідними напрямками лікування."
        />
        <div className="team-grid">
          {doctors.map((d, i) => (
            <Reveal key={`${d.name}-${i}`} className="doc" delay={i * 80}>
              <div className="doc-ring">
                <img className="doc-avatar" src={d.photo} alt={`${d.role} клініки DENTIX`} loading="lazy" />
              </div>
              <h3>{d.name}</h3>
              <p className="doc-role">{d.role}</p>
              <BookingButton className="doc-booking" doctorId={`demo-doctor-${i === 0 ? "a" : "b"}`}>
                Обрати лікаря
              </BookingButton>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
