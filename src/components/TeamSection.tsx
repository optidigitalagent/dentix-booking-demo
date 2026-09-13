import { selectImplantProstheticsDoctors, type ImplantProstheticsRoute } from "@/data/implant-prosthetics-pages";
import { selectSurgeryDoctors, type SurgeryRoute } from "@/data/surgery-pages";
import { selectTherapyDoctors, type TherapyRoute } from "@/data/therapy-pages";
import { siteHref } from "@/lib/site-href";
import { useManagedContent } from "@/hooks/use-managed-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { BookingButton } from "./booking/BookingContext";

export function TeamSection({ therapyRoute, surgeryRoute, implantProstheticsRoute }: { therapyRoute?: TherapyRoute; surgeryRoute?: SurgeryRoute; implantProstheticsRoute?: ImplantProstheticsRoute } = {}) {
  const { doctors: managedDoctors, doctorsSource } = useManagedContent();
  const doctors = implantProstheticsRoute ? selectImplantProstheticsDoctors(implantProstheticsRoute, managedDoctors) : surgeryRoute ? selectSurgeryDoctors(managedDoctors) : therapyRoute ? selectTherapyDoctors(therapyRoute, managedDoctors) : managedDoctors;

  return (
    <section className="section" id="team" data-content-source={doctorsSource}>
      <div className="wrap">
        <SectionHeading
          kicker="Команда"
          title={implantProstheticsRoute || surgeryRoute ? "Лікар напрямку" : therapyRoute === "microscope" ? "Ендодонтист, мікроскопіст DENTIX" : therapyRoute ? "Лікарі-терапевти DENTIX" : "Лікарі DENTIX"}
          lede={implantProstheticsRoute || surgeryRoute ? "Інформацію про лікаря та прийом уточнюйте у клініці телефоном." : "Прийом ведуть лікарі клініки за відповідними напрямками лікування."}
        />
        {!doctors.length && <p>Уточніть лікаря цього напрямку у клініці телефоном.</p>}
        <div className={`team-grid${therapyRoute || surgeryRoute || implantProstheticsRoute ? " therapy-team-grid" : ""}`}>
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
                {!therapyRoute && !surgeryRoute && !implantProstheticsRoute && d.description ? <p className="doc-description">{d.description}</p> : null}
                {!therapyRoute && !surgeryRoute && !implantProstheticsRoute && d.role.includes("Лікар-терапевт") && <a className="doc-booking" href={siteHref(d.role.includes("ендодонтист") && d.role.includes("мікроскопіст") ? "/lechenie-pod-mikroskopom/" : "/terapevtychna-stomatolohiia/")}>{d.role.includes("ендодонтист") && d.role.includes("мікроскопіст") ? "Лікування каналів під мікроскопом" : "Терапевтична стоматологія"}</a>}
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
