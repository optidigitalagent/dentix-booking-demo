import type { CSSProperties } from "react";
import priceHeroImg from "@/assets/about-2.jpg";
import { BackToTopButton } from "@/components/BackToTopButton";
import { BookingButton } from "@/components/booking/BookingContext";
import { ContactSection } from "@/components/ContactSection";
import { Reveal } from "@/components/Reveal";
import { SiteLayout } from "@/components/SiteLayout";
import { useManagedContent } from "@/hooks/use-managed-content";
import { siteHref } from "@/lib/site-href";
import { site } from "@/data/site";

export function PriceDemo() {
  const { priceBlocks, priceSource } = useManagedContent();

  return (
    <SiteLayout>
      <section
        className="price-hero"
        style={{ "--price-hero-image": `url(${priceHeroImg})` } as CSSProperties}
      >
        <div className="wrap price-hero-grid">
          <div className="price-hero-copy">
            <nav className="breadcrumbs" aria-label="Навігація">
              <a href={siteHref("/")}>Головна</a> <span aria-hidden="true">/</span>{" "}
              <span>Ціни</span>
            </nav>
            <p className="eyebrow">Прайс клініки</p>
            <h1 className="hero-title">Ціни DENTIX</h1>
            <p className="service-intro">
              Послуги згруповано за напрямками. Остаточну вартість і склад індивідуального плану
              підтверджує клініка.
            </p>
            <div className="hero-actions">
              <a className="btn" href={site.phonePrimaryHref}>
                {site.phonePrimary}
              </a>
              <BookingButton className="btn btn-ghost">
                Записатися онлайн <span aria-hidden="true">→</span>
              </BookingButton>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap price-content" data-content-source={priceSource}>
        <div className="price-quick-shell">
          <nav className="price-quick" aria-label="Категорії прайсу">
            {priceBlocks.map((block) => (
              <a key={block.id} href={`#${block.id}`}>
                {block.kicker}
              </a>
            ))}
          </nav>
        </div>

        <div className="price-list">
          {priceBlocks.map((block, index) => (
            <Reveal className="price-block" id={block.id} key={block.id} delay={index * 50}>
              <div className="price-block-head">
                {block.num ? <span className="price-block-num">{block.num}</span> : null}
                <div>
                  <span className="sec-kicker">{block.kicker}</span>
                  <h2 className="price-block-title">{block.title}</h2>
                </div>
              </div>
              <ul>
                {block.rows.map((row) => (
                  <li className="price-row" key={`${row.name}-${row.cost}`}>
                    <span className="price-name-wrap">
                      <span className="price-name">{row.name}</span>
                      {row.note ? <small className="price-row-note">{row.note}</small> : null}
                    </span>
                    <span className="price-cost">{row.cost}</span>
                  </li>
                ))}
              </ul>
              {block.note ? <p className="price-note">{block.note}</p> : null}
              {(["profilaktyka", "terapiya", "ortodontiya"] as string[]).includes(block.id) ? (
                <BookingButton
                  className="price-booking-link"
                  serviceId={
                    (
                      {
                        profilaktyka: "demo-hygiene",
                        terapiya: "demo-therapy",
                        ortodontiya: "demo-ortho",
                      } as Record<string, string>
                    )[block.id]
                  }
                >
                  Записатися за напрямком
                </BookingButton>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>

      <ContactSection />
      <BackToTopButton />
    </SiteLayout>
  );
}
