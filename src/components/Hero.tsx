import { siteHref } from "@/lib/site-href";
import { HeroVideo } from "./HeroVideo";
import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { StatsRow } from "./StatsRow";
import { BookingButton } from "./booking/BookingContext";

export function Hero() {
  return (
    <section className="hero">
      <HeroVideo />
      <div className="wrap">
        <div className="hero-copy">
          <Reveal as="p" className="eyebrow">
            Стоматологія повного циклу
          </Reveal>
          <h1 className="hero-title">
            <span>Стоматологія</span>{" "}
            <span>{site.name}</span>
          </h1>
          <Reveal as="p" className="hero-lede" delay={80}>
            Хірургія, імплантація, лікування та відновлення усмішки за індивідуальним планом.
          </Reveal>
          <Reveal className="hero-actions" delay={140}>
            <BookingButton className="btn">Записатися онлайн</BookingButton>
            <a className="btn btn-ghost" href="#services">
              Наші послуги <span aria-hidden="true">→</span>
            </a>
          </Reveal>
          <p className="hero-lede">{site.tagline} у Дніпрі. <a href={siteHref("/kontakty/")}>{site.address}</a>. <a href={siteHref("/likari/")}>Лікарі клініки</a>.</p>
          <StatsRow />
        </div>
      </div>
    </section>
  );
}
