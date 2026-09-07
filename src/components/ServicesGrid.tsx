import { services } from "@/data/services";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { siteHref } from "@/lib/site-href";
import { BookingButton } from "./booking/BookingContext";

const bookingDirections = ["Профілактика", "Терапія", "Ортодонтія"];

export function ServicesGrid() {
  return (
    <section className="section" id="services">
      <div className="wrap">
        <SectionHeading
          kicker="Послуги"
          title="Напрямки лікування"
          lede="Шість основних напрямків клініки DENTIX — від профілактики до хірургії та імплантації."
        />
        <div className="svc-grid">
          {services.map((s, i) => (
            <Reveal key={s.num} className="svc-card" delay={i * 60}>
              <span className="svc-ico">{s.num}</span>
              <div className="svc-body">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
              <a className="svc-link" href={siteHref(s.href)}>
                {s.linkLabel} <span aria-hidden="true">→</span>
              </a>
              {bookingDirections.includes(s.title) ? (
                <BookingButton className="svc-booking-link" requestedInterest={s.title}>
                  Записатися онлайн
                </BookingButton>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
