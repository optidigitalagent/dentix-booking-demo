import heroImg from "@/assets/hero.jpg";
import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { StatsRow } from "./StatsRow";
import { BookingButton } from "./booking/BookingContext";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <img src={heroImg} alt="Кабінет стоматологічної клініки DENTIX" width={1600} height={1000} />
        <div className="hero-overlay" />
      </div>
      <div className="wrap">
        <div className="hero-copy">
          <Reveal as="p" className="eyebrow">
            Стоматологія повного циклу
          </Reveal>
          <h1 className="hero-title">
            <span>Стоматологія</span>
            <span>{site.name}</span>
          </h1>
          <Reveal as="p" className="hero-lede" delay={80}>
            Лікування, ортодонтія, імплантація та відновлення усмішки за індивідуальним
            планом.
          </Reveal>
          <Reveal className="hero-actions" delay={140}>
            <BookingButton className="btn">Записатися онлайн</BookingButton>
            <a className="btn btn-ghost" href="#services">
              Наші послуги <span aria-hidden="true">→</span>
            </a>
          </Reveal>
          <StatsRow />
        </div>
      </div>
    </section>
  );
}
