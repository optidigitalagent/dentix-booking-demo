import { useEffect, useState } from "react";
import { heroSlides } from "@/data/about";
import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { StatsRow } from "./StatsRow";
import { BookingButton } from "./booking/BookingContext";

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const syncRotation = () => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
      if (reducedMotion.matches) return;
      timer = window.setInterval(() => {
        setActiveSlide((current) => (current + 1) % heroSlides.length);
      }, 4800);
    };

    syncRotation();
    reducedMotion.addEventListener("change", syncRotation);
    return () => {
      if (timer) window.clearInterval(timer);
      reducedMotion.removeEventListener("change", syncRotation);
    };
  }, []);

  return (
    <section className="hero">
      <div
        className="hero-bg"
        role="region"
        aria-roledescription="carousel"
        aria-label="Фотографії клініки DENTIX"
      >
        {heroSlides.map((slide, index) => (
          <img
            className={`hero-gallery-slide ${index === activeSlide ? "is-active" : ""}`}
            src={slide.src}
            alt={slide.alt}
            width={1800}
            height={1200}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            aria-hidden={index !== activeSlide}
            style={{ objectPosition: slide.objectPosition }}
            key={slide.id}
          />
        ))}
        <div className="hero-overlay" />
        <div className="hero-gallery-dots" aria-label="Вибір фотографії">
          {heroSlides.map((slide, index) => (
            <button
              type="button"
              className={index === activeSlide ? "is-active" : ""}
              aria-label={`Фото ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
              key={slide.id}
            />
          ))}
        </div>
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
            Лікування, ортодонтія, імплантація та відновлення усмішки за індивідуальним планом.
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
