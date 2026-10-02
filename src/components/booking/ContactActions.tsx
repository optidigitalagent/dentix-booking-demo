import { site } from "@/data/site";
import { siteHref } from "@/lib/site-href";

type ContactActionsProps = { requestedInterest?: string | undefined };

export function ContactActions({ requestedInterest }: ContactActionsProps) {
  return (
    <div className="contact-bridge" data-conversion-intent="booking_contact">
      {requestedInterest ? <p className="contact-bridge-interest">Цікавить: <strong>{requestedInterest}</strong></p> : null}
      <p className="contact-bridge-intro">Оберіть зручний спосіб зв’язку з адміністратором. Візит буде підтверджено після розмови.</p>
      <div className="contact-bridge-links" aria-label="Способи зв’язку для запису">
        <a className="contact-bridge-link contact-bridge-link-primary" href={site.phonePrimaryHref} data-contact-channel="phone_primary">Зателефонувати: {site.phonePrimary}</a>
        <a className="contact-bridge-link" href={site.phoneSecondaryHref} data-contact-channel="phone_secondary">Зателефонувати: {site.phoneSecondary}</a>
        <a className="contact-bridge-link" href={site.viberPrimaryHref} data-contact-channel="viber_primary">{site.viberPrimary}</a>
        <a className="contact-bridge-link" href={site.viberHref} data-contact-channel="viber_secondary">{site.viber}</a>
        <a className="contact-bridge-link" href={site.instagramHref} target="_blank" rel="noopener noreferrer" data-contact-channel="instagram">Instagram: {site.instagram}</a>
        <a className="contact-bridge-link" href={siteHref(site.contactsHref)} data-contact-channel="contacts">Контакти та карта</a>
      </div>
      <p className="contact-bridge-note">Відкриття цього вікна чи перехід за посиланням не резервує час прийому.</p>
      <p className="contact-bridge-note">Не надсилайте медичні дані у повідомленнях.</p>
    </div>
  );
}
