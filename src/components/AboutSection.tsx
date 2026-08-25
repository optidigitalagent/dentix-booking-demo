import { useEffect, useState } from "react";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import about3 from "@/assets/about-3.jpg";
import { Reveal } from "./Reveal";
import { siteHref } from "@/lib/site-href";

const slides = [
  { src: about1, alt: "Інтер'єр клініки DENTIX" },
  { src: about2, alt: "Стоматологічний кабінет DENTIX" },
  { src: about3, alt: "Зона очікування клініки DENTIX" },
];

const bullets = [
  "Прийом за попереднім записом телефоном",
  "Основні напрямки лікування в одній клініці",
  "Відкритий прайс на сайті",
  "Індивідуальний план після діагностики",
];

export function AboutSection() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section about" id="about">
      <div className="wrap about-grid">
        <Reveal className="about-media">
          <div className="about-gallery">
            {slides.map((s, idx) => (
              <img
                key={s.src}
                className={`about-slide${idx === i ? " is-active" : ""}`}
                src={s.src}
                alt={s.alt}
                loading="lazy"
              />
            ))}
            <button
              className="gallery-nav prev"
              aria-label="Попереднє фото"
              onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
            >
              ‹
            </button>
            <button
              className="gallery-nav next"
              aria-label="Наступне фото"
              onClick={() => setI((v) => (v + 1) % slides.length)}
            >
              ›
            </button>
            <div className="gallery-dots">
              {slides.map((s, idx) => (
                <button
                  key={s.src}
                  className={idx === i ? "is-active" : ""}
                  aria-label={`Фото ${idx + 1}`}
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
            DENTIX — стоматологія повного циклу: профілактика, терапія, пародонтологія, ортодонтія,
            ортопедія та хірургія в одному місці.
          </p>
          <p className="sec-lede">
            План лікування складають після огляду й діагностики, а вартість основних послуг
            опублікована у відкритому прайсі.
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
