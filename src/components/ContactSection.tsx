import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { LeadForm } from "./LeadForm";

const contactSlots = [
  { label: "Телефони", value: `${site.phonePrimary} · ${site.phoneSecondary}` },
  { label: "Адреса", value: `${site.city}, ${site.address}` },
  { label: "Графік", value: `${site.schedule} · ${site.scheduleNote}` },
  { label: "Instagram", value: site.instagram, href: site.instagramHref },
];

export function ContactSection() {
  return (
    <section className="section contact contact-stage" id="contact">
      <div className="wrap">
        <SectionHeading
          kicker="Запис"
          title="Заплануйте візит до DENTIX"
          lede="Зв’яжіться з клінікою телефоном, в Instagram або у Viber. Адресу, графік і карту зібрано нижче."
          center={false}
        />

        <div className="contact-composition">
          <Reveal as="aside" className="contact-rail">
            <span className="contact-rail-index" aria-hidden="true">
              01
            </span>
            <p className="contact-rail-kicker">Швидкий зв’язок</p>
            <h3>Усе потрібне для запису — в одному місці</h3>
            <p className="contact-rail-copy">
              Робочі номери, адреса, графік і офіційний Instagram.
            </p>

            <div className="contact-slots" aria-label="Контактні дані DENTIX">
              {contactSlots.map((item) => (
                <div className="contact-slot" key={item.label}>
                  <span>{item.label}</span>
                  <strong>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="contact-data-state" role="status">
              <span className="contact-state-dot" aria-hidden="true" />
              Контакти звірено з офіційними джерелами
            </div>
          </Reveal>

          <Reveal as="div" className="contact-panel" delay={90}>
            <div className="contact-panel-head">
              <div>
                <p className="contact-panel-kicker">Зворотний зв’язок</p>
                <h3>Залишити заявку</h3>
              </div>
              <span className="contact-panel-status">без медичних даних</span>
            </div>
            <LeadForm sourceSite={__DENTIX_LEAD_SOURCE__} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
