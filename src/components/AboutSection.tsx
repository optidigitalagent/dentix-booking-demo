import { useEffect, useState } from "react";
import { aboutSlides } from "@/data/about";
import { Reveal } from "./Reveal";
import { siteHref } from "@/lib/site-href";

const bullets = [
  "Прийом за попереднім записом телефоном",
  "Основні напрямки лікування в одній клініці",
  "Відкритий прайс на сайті",
  "Індивідуальний план після діагностики",
  "Лікування дітей наразі не проводимо",
];

export function AboutSection() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setI((v) => (v + 1) % aboutSlides.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section about" id="about">
      <div className="wrap about-grid">
        <Reveal className="about-media">
          <div className="about-gallery">
            {aboutSlides.map((slide, idx) => (
              <img
                key={slide.id}
                className={`about-slide${idx === i ? " is-active" : ""}`}
                src={slide.src}
                alt={slide.alt}
                loading={idx < 2 ? "eager" : "lazy"}
                decoding="async"
                style={{ objectPosition: slide.objectPosition }}
              />
            ))}
            <button
              className="gallery-nav prev"
              aria-label="Попереднє фото"
              onClick={() =>
                setI((v) => (v - 1 + aboutSlides.length) % aboutSlides.length)
              }
            >
              ‹
            </button>
            <button
              className="gallery-nav next"
              aria-label="Наступне фото"
              onClick={() => setI((v) => (v + 1) % aboutSlides.length)}
            >
              ›
            </button>
            <div className="gallery-dots">
              {aboutSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  className={idx === i ? "is-active" : ""}
                  aria-label={`Фото ${idx + 1}`}
                  aria-current={idx === i ? "true" : undefined}
                  onClick={() => setI(idx)}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="about-copy" delay={80}>
          <span className="sec-kicker">Про клініку</span>
          <h2 className="sec-title">Клініка DENTIX</h2>
          <p className="sec-lede">
            DENTIX — стоматологія повного циклу: профілактика, терапія,
            пародонтологія, ортодонтія, ортопедія та хірургія в одному місці.
          </p>
          <p className="sec-lede">
            План лікування складають після огляду й діагностики, а вартість
            основних послуг опублікована у відкритому прайсі.
          </p>
          <p className="sec-lede">
            DENTIX підтримує роботу під час відключень електроенергії завдяки
            резервному живленню — інверторам і генераторам. У клініці доступна
            седація. DENTIX також приймає пацієнтів із гострим болем.
          </p>
          <ul className="about-list">
            {bullets.map((b) => (
              <li key={b}>
                <span className="tick" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <a className="btn btn-ghost" href={siteHref("/price.html")}>
            Переглянути прайс <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
