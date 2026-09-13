import type { CSSProperties } from "react";
import clinicImage from "@/assets/about-2.jpg";
import { SiteLayout } from "@/components/SiteLayout";
import { TeamSection } from "@/components/TeamSection";
import { ContactSection } from "@/components/ContactSection";
import { BookingButton } from "@/components/booking/BookingContext";
import { useManagedContent } from "@/hooks/use-managed-content";
import { site } from "@/data/site";
import { implantProstheticsPages, selectImplantProstheticsPrices, type ImplantProstheticsRoute } from "@/data/implant-prosthetics-pages";
import { routeMetadata } from "@/page-metadata";
import { siteHref } from "@/lib/site-href";

export function ImplantProstheticsPage({ route }: { route: ImplantProstheticsRoute }) {
  const page = implantProstheticsPages[route];
  const { priceBlocks, priceSource } = useManagedContent();
  const prices = selectImplantProstheticsPrices(route, priceBlocks);
  return (
    <SiteLayout>
      <section className="price-hero therapy-hero" style={{ "--price-hero-image": `url(${clinicImage})` } as CSSProperties}>
        <div className="wrap price-hero-grid"><div className="price-hero-copy">
          <nav className="breadcrumbs" aria-label="Навігація">
            <a href={siteHref("/")}>Головна</a><span aria-hidden="true"> / </span>
            <span aria-current="page">{page.label}</span>
          </nav>
          <p className="eyebrow">{site.name} · {site.tagline}</p>
          <h1 className="hero-title">{page.h1}</h1>
          <p className="service-intro" id="service-answer">{page.answer}</p>
          <div className="hero-actions">
            <a className="btn" href={site.phonePrimaryHref}>{site.phonePrimary}</a>
            <BookingButton className="btn btn-ghost">Узгодити прийом</BookingButton>
          </div>
          <nav className="entity-links" aria-label="На цій сторінці">
            <a href="#service-prices">Вартість послуг</a><a href="#team">Уточнити лікаря</a><a href="#related-services">Пов’язані послуги</a>
          </nav>
        </div></div>
      </section>

      <section className="section" id="service-scope">
        <div className="wrap therapy-overview">
          <div>
            <span className="sec-kicker">Послуги DENTIX</span>
            <h2 className="sec-title">{page.label}</h2>
            <ul className="therapy-scope">{page.scope.map((label) => <li key={label}>{label}</li>)}</ul>
          </div>
          <div>
            <h2 className="sec-title">Як уточнити обсяг і вартість</h2>
            <p className="sec-lede">Зателефонуйте до DENTIX для узгодження консультації. Після огляду й діагностики клініка підтверджує склад індивідуального плану, обсяг послуг та остаточну вартість.</p>
            <a className="price-booking-link" href={siteHref("/kontakty/")}>Контакти клініки →</a>
          </div>
        </div>
      </section>

      <section className="section therapy-prices" id="service-prices" data-content-source={priceSource}>
        <div className="wrap">
          <span className="sec-kicker">Відкритий прайс</span>
          <h2 className="sec-title">Вартість послуг</h2>
          <p className="sec-lede">Окремі позиції поточного прайсу DENTIX. Обсяг кожної послуги й остаточну вартість підтверджує клініка.</p>
          {prices.length ? <ul className="price-block therapy-price-list">{prices.map((row, index) => (
            <li className="price-row" key={`${row.name}-${index}`}>
              <span className="price-name-wrap"><span className="price-name">{row.name}</span>{row.note && <small className="price-row-note">{row.note}</small>}</span>
              <span className="price-cost">{row.cost}</span>
            </li>
          ))}</ul> : <p>Уточніть актуальну вартість цих послуг у клініці телефоном.</p>}
          <a className="price-booking-link" href={siteHref("/price.html")}>Повний прайс DENTIX →</a>
        </div>
      </section>

      <TeamSection implantProstheticsRoute={route} />

      <section className="section" id="service-questions">
        <div className="wrap">
          <h2 className="sec-title">Питання перед зверненням</h2>
          <div className="therapy-questions">
            {[page.question,
              { q: "Як уточнити лікаря та час прийому?", a: "Зателефонуйте до DENTIX. У клініці підтвердять лікаря цього напрямку та узгодять прийом." },
            ].map(({ q, a }) => <details key={q} open><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="section" id="related-services">
        <div className="wrap">
          <h2 className="sec-title">Пов’язані послуги</h2>
          <nav className="therapy-related" aria-label="Пов’язані послуги DENTIX">
            {page.related.map((key) => <a className="btn btn-ghost" key={key} href={siteHref("/" + routeMetadata[key].path)}>{routeMetadata[key].label} →</a>)}
          </nav>
          <nav className="entity-links" aria-label="Сторінки клініки">
            <a href={siteHref("/likari/")}>Усі лікарі DENTIX</a><a href={siteHref("/kontakty/")}>Контакти та графік роботи</a><a href={siteHref("/price.html")}>Ціни на послуги</a>
          </nav>
        </div>
      </section>
      <ContactSection lede="Зв’яжіться з клінікою телефоном, в Instagram або у Viber для узгодження прийому." />
    </SiteLayout>
  );
}
