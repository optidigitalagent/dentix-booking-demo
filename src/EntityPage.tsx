import type { CSSProperties } from "react";
import clinicImage from "@/assets/about-2.jpg";
import { SiteLayout } from "@/components/SiteLayout";
import { TeamSection } from "@/components/TeamSection";
import { ContactInfoSection } from "@/components/ContactInfoSection";
import { ContactSection } from "@/components/ContactSection";
import { BookingButton } from "@/components/booking/BookingContext";
import { site } from "@/data/site";
import { siteHref } from "@/lib/site-href";

export function EntityPage({ route }: { route: "doctors" | "contacts" }) {
  const doctors = route === "doctors";
  const label = doctors ? "Лікарі" : "Контакти";
  return (
    <SiteLayout>
      <section className="price-hero" style={{ "--price-hero-image": `url(${clinicImage})` } as CSSProperties}>
        <div className="wrap price-hero-grid"><div className="price-hero-copy">
          <nav className="breadcrumbs" aria-label="Навігація">
            <a href={siteHref("/")}>Головна</a> <span aria-hidden="true">/</span> <span>{label}</span>
          </nav>
          <p className="eyebrow">{site.tagline} у Дніпрі</p>
          <h1 className="hero-title">{label} DENTIX</h1>
          <p className="service-intro">{doctors
            ? "Оберіть лікаря за напрямком лікування. Прийом узгоджується за попередньою домовленістю телефоном."
            : `${site.city}, ${site.address}, ${site.addressNote}. Зателефонуйте для узгодження прийому.`}</p>
          <div className="hero-actions">
            <a className="btn" href={site.phonePrimaryHref}>{site.phonePrimary}</a>
            <BookingButton className="btn btn-ghost">Узгодити прийом</BookingButton>
          </div>
          <nav className="entity-links" aria-label="Сторінки клініки">
            <a href={siteHref(doctors ? "/kontakty/" : "/likari/")}>{doctors ? "Контакти та графік роботи" : "Лікарі клініки"}</a>
            <a href={siteHref("/price.html")}>Ціни на послуги</a>
          </nav>
        </div></div>
      </section>
      {doctors ? <TeamSection /> : <ContactInfoSection />}
      <ContactSection lede="Зв’яжіться з клінікою телефоном, в Instagram або у Viber для узгодження прийому." />
    </SiteLayout>
  );
}
