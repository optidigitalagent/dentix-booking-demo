import { selectTherapyDoctors, type TherapyRoute } from "@/data/therapy-pages";
import { siteHref } from "@/lib/site-href";
import { useManagedContent } from "@/hooks/use-managed-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { BookingButton } from "./booking/BookingContext";

export function TeamSection({ therapyRoute }: { therapyRoute?: TherapyRoute } = {}) {
  const { doctors: managedDoctors, doctorsSource } = useManagedContent();
  const doctors = therapyRoute ? selectTherapyDoctors(therapyRoute, managedDoctors) : managedDoctors;

  return (
    <section className="section" id="team" data-content-source={doctorsSource}>
      <div className="wrap">
        <SectionHeading
          kicker="Команда"
          title={therapyRoute === "microscope" ? "Ендодонтист, мікроскопіст DENTIX" : therapyRoute ? "Лікарі-терапевти DENTIX" : "Лікарі DENTIX"}
          lede="Прийом ведуть лікарі клініки за відповідними напрямками лікування."
        />
        {!doctors.length && <p>Уточніть лікаря цього напрямку у клініці телефоном.</p>}
        <div className={`team-grid${therapyRoute ? " therapy-team-grid" : ""}`}>
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
                {!therapyRoute && d.description ? <p className="doc-description">{d.description}</p> : null}
                {!therapyRoute && d.role.includes("Лікар-терапевт") && <a className="doc-booking" href={siteHref(d.role.includes("ендодонтист") && d.role.includes("мікроскопіст") ? "/lechenie-pod-mikroskopom/" : "/terapevtychna-stomatolohiia/")}>{d.role.includes("ендодонтист") && d.role.includes("мікроскопіст") ? "Лікування каналів під мікроскопом" : "Терапевтична стоматологія"}</a>}
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
