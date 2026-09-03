import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ContactInfoSection() {
  return (
    <section className="section contact-info-section" id="contact-info">
      <div className="wrap">
        <SectionHeading kicker="Контакти" title="Як нас знайти" />
        <div className="contact-info">
          <Reveal className="info-stack">
            <div className="info-block">
              <h3>Адреса</h3>
              <p>
                {site.address}
                <br />
                {site.city}
                <br />
                {site.addressNote}
              </p>
            </div>
            <div className="info-block">
              <h3>Телефони</h3>
              <p>
                {site.contactDataReady ? (
                  <a href={site.phonePrimaryHref}>{site.phonePrimary}</a>
                ) : (
                  site.phonePrimary
                )}
                <br />
                {site.contactDataReady ? (
                  <a href={site.phoneSecondaryHref}>{site.phoneSecondary}</a>
                ) : (
                  site.phoneSecondary
                )}
              </p>
            </div>
            <div className="info-block">
              <h3>Графік роботи</h3>
              <p>
                {site.schedule}
                <br />
                {site.scheduleNote}
              </p>
            </div>
            <div className="info-block">
              <h3>Зв’язок онлайн</h3>
              <p>
                <a href={site.instagramHref} target="_blank" rel="noreferrer">
                  Instagram: {site.instagram}
                </a>
                <br />
                <a href={site.viberHref}>{site.viber}</a>
                <br />
                <a href={site.emailHref}>{site.email}</a>
              </p>
            </div>
          </Reveal>

          <Reveal className="contact-map" delay={80}>
            {site.contactDataReady && site.mapEmbed ? (
              <>
                <iframe
                  title="Карта розташування клініки DENTIX"
                  src={site.mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a className="map-link" href={site.mapLink} target="_blank" rel="noreferrer">
                  Відкрити на мапі <span aria-hidden="true">→</span>
                </a>
              </>
            ) : (
              <div
                className="map-placeholder-panel"
                aria-label="Місце для підтвердженої карти DENTIX"
              >
                <span className="map-coordinate" aria-hidden="true">
                  DENTIX / MAP
                </span>
                <div>
                  <p className="contact-panel-kicker">Карта</p>
                  <h3>Локація буде додана після підтвердження адреси</h3>
                  <p>Жодної випадкової точки на карті: цей блок очікує реальні дані клініки.</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
