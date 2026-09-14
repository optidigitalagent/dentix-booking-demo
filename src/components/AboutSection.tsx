import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
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

const galleryItemCount = aboutSlides.length;

export function AboutSection() {
  const [i, setI] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = typeof IntersectionObserver === "undefined";
    let timer: number | undefined;
    const syncRotation = () => {
      window.clearTimeout(timer);
      if (inView && !document.hidden && !reducedMotion.matches && !rotationPaused) {
        timer = window.setTimeout(() => setI((v) => (v + 1) % galleryItemCount), 5000);
      }
    };
    const observer = typeof IntersectionObserver === "undefined" ? null :
      new IntersectionObserver(([entry]) => {
        inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.25);
        syncRotation();
      }, { threshold: [0, 0.25] });
    observer?.observe(gallery);
    document.addEventListener("visibilitychange", syncRotation);
    reducedMotion.addEventListener("change", syncRotation);
    syncRotation();
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncRotation);
      reducedMotion.removeEventListener("change", syncRotation);
    };
  }, [i, rotationPaused]);

  return (
    <section className="section about" id="about">
      <div className="wrap about-grid">
        <Reveal className="about-media">
          <div ref={galleryRef} className="about-gallery">
            <button
              type="button"
              className="gallery-nav gallery-playback"
              aria-label={rotationPaused ? "Відновити зміну фотографій" : "Призупинити зміну фотографій"}
              onClick={() => setRotationPaused((paused) => !paused)}
            >
              {rotationPaused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
            </button>
            {aboutSlides.map((slide, idx) => (
              <img
                key={slide.id}
                className={`about-slide${idx === i ? " is-active" : ""}`}
                src={slide.src}
                alt={slide.alt}
                aria-hidden={idx !== i}
                loading={idx < 2 ? "eager" : "lazy"}
                decoding="async"
                style={{ objectPosition: slide.objectPosition }}
              />
            ))}
            <button
              type="button"
              className="gallery-nav prev"
              aria-label="Попередній елемент галереї"
              onClick={() => { setRotationPaused(true); setI((v) => (v - 1 + galleryItemCount) % galleryItemCount); }}
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav next"
              aria-label="Наступний елемент галереї"
              onClick={() => { setRotationPaused(true); setI((v) => (v + 1) % galleryItemCount); }}
            >
              ›
            </button>
            <div className="gallery-dots">
              {aboutSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={idx === i ? "is-active" : ""}
                  aria-label={`Фото ${idx + 1}`}
                  aria-current={idx === i ? "true" : undefined}
                  onClick={() => { setRotationPaused(true); setI(idx); }}
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
          <p className="sec-lede">
            DENTIX підтримує роботу під час відключень електроенергії завдяки резервному живленню —
            інверторам і генераторам. У клініці доступна седація. DENTIX також приймає пацієнтів із
            гострим болем.
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
