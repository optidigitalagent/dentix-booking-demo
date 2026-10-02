import type { Doctor } from "@/data/doctors";
import type { PriceRow } from "@/data/prices";
import type { TherapyPage } from "@/data/therapy-pages";
import { siteHref } from "@/lib/site-href";
import { BookingButton } from "./booking/BookingContext";

type Props = {
  page: TherapyPage;
  doctors: Doctor[];
  doctorsSource: string;
  prices: PriceRow[];
  priceSource: string;
};

export function TherapyEvidenceSummary({ page, doctors, doctorsSource, prices, priceSource }: Props) {
  return (
    <section className="section therapy-evidence" id="service-scope">
      <div className="wrap">
        <span className="sec-kicker">Послуги DENTIX</span>
        <h2 className="sec-title">Канали та мікроскоп</h2>
        <p className="sec-lede" id="service-answer">{page.answer}</p>
        <ul className="therapy-scope">{page.scope.map((label) => <li key={label}>{label}</li>)}</ul>

        <div className="therapy-evidence-grid">
          <section id="team" data-content-source={doctorsSource}>
            <h2 className="sec-title">Ендодонтист, мікроскопіст DENTIX</h2>
            {doctors.length ? doctors.map((doctor) => (
              <article className="therapy-evidence-doctor doc" key={doctor.id}>
                <img src={doctor.photo} alt={doctor.alt} width={960} height={1280} loading="lazy" style={{ objectPosition: doctor.objectPosition }} />
                <div><h3>{doctor.name}</h3><p className="doc-role">{doctor.role}</p></div>
              </article>
            )) : <p>Уточніть лікаря цього напрямку у клініці телефоном.</p>}
            <a href={siteHref("/likari/")}>Усі лікарі DENTIX →</a>
          </section>

          <section id="service-prices" data-content-source={priceSource}>
            <h2 className="sec-title">Вартість послуг</h2>
            <p>Позиції з поточного прайсу DENTIX. Остаточну вартість і склад індивідуального плану підтверджує клініка після огляду й діагностики.</p>
            {prices.length ? <ul className="price-block therapy-price-list">{prices.map((row, index) => (
              <li className="price-row" key={`${row.name}-${index}`}>
                <span className="price-name-wrap"><span className="price-name">{row.name}</span>{row.note && <small className="price-row-note">{row.note}</small>}</span>
                <span className="price-cost">{row.cost}</span>
              </li>
            ))}</ul> : <p>Уточніть актуальну вартість цих послуг у клініці телефоном.</p>}
            <a href={siteHref("/price.html")}>Повний прайс DENTIX →</a>
          </section>
        </div>
        <div className="therapy-evidence-actions">
          <BookingButton className="btn" requestedInterest={page.label}>Записатися</BookingButton>
          <a href={siteHref("/kontakty/")}>Контакти та графік роботи →</a>
        </div>
      </div>
    </section>
  );
}
