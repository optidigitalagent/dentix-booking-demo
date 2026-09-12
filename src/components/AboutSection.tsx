import { useEffect, useRef, useState } from "react";
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

const galleryItemCount = aboutSlides.length + 1;

export function AboutSection() {
  const [i, setI] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    const video = videoRef.current;
    if (!gallery || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let autoplayAttempted = false;
    let resumeWhenVisible = false;
    let timer: number | undefined;

    const syncPlayback = () => {
      window.clearTimeout(timer);
      if (!inView || document.hidden) {
        // Only resume a video that visibility interrupted; preserve a viewer's manual pause.
        if (i === 0 && !video.paused && !video.ended) resumeWhenVisible = true;
        video.pause();
        return;
      }
      if (i !== 0) video.pause();
      if (reducedMotion.matches) return;

      if (i === 0) {
        if (!autoplayAttempted || resumeWhenVisible) {
          autoplayAttempted = true;
          resumeWhenVisible = false;
          video.muted = true;
          void video.play().catch(() => {
            // Autoplay can be blocked; leave the poster and native controls available.
          });
        }
        return;
      }

      timer = window.setTimeout(() => setI((v) => (v + 1) % galleryItemCount), 5000);
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) {
        resumeWhenVisible = false;
        video.pause();
      }
      syncPlayback();
    };
    const onPlay = () => {
      if (i !== 0 || !inView || document.hidden) {
        if (i === 0 && !video.ended) resumeWhenVisible = true;
        video.pause();
      }
      autoplayAttempted = true;
    };
    const checkViewport = () => {
      const rect = gallery.getBoundingClientRect();
      const visibleWidth = Math.max(
        0,
        Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
      );
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
      );
      inView =
        rect.width > 0 &&
        rect.height > 0 &&
        (visibleWidth * visibleHeight) / (rect.width * rect.height) >= 0.25;
      syncPlayback();
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.25);
              syncPlayback();
            },
            { threshold: [0, 0.25] },
          );

    video.addEventListener("play", onPlay);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", onMotionChange);
    if (observer) {
      observer.observe(gallery);
    } else {
      checkViewport();
      window.addEventListener("scroll", checkViewport, { passive: true });
      window.addEventListener("resize", checkViewport);
    }

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("scroll", checkViewport);
      window.removeEventListener("resize", checkViewport);
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", onMotionChange);
      video.removeEventListener("play", onPlay);
      video.pause();
    };
  }, [i]);

  return (
    <section className="section about" id="about">
      <div className="wrap about-grid">
        <Reveal className="about-media">
          <div ref={galleryRef} className={`about-gallery${i === 0 ? " is-video" : ""}`}>
            <video
              ref={videoRef}
              className={`about-slide about-video${i === 0 ? " is-active" : ""}`}
              src={siteHref("/media/dentix-clinic-tour.mp4")}
              poster={siteHref("/media/dentix-clinic-tour-poster.webp")}
              aria-label="Відеоогляд клініки DENTIX"
              controls
              playsInline
              muted
              preload="none"
              hidden={i !== 0}
              inert={i !== 0}
              aria-hidden={i !== 0}
              tabIndex={i === 0 ? 0 : -1}
              onEnded={() => setI((current) => (current === 0 ? 1 : current))}
            />
            {aboutSlides.map((slide, idx) => (
              <img
                key={slide.id}
                className={`about-slide${idx + 1 === i ? " is-active" : ""}`}
                src={slide.src}
                alt={slide.alt}
                aria-hidden={idx + 1 !== i}
                loading={idx < 2 ? "eager" : "lazy"}
                decoding="async"
                style={{ objectPosition: slide.objectPosition }}
              />
            ))}
            <button
              type="button"
              className="gallery-nav prev"
              aria-label="Попередній елемент галереї"
              onClick={() => setI((v) => (v - 1 + galleryItemCount) % galleryItemCount)}
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav next"
              aria-label="Наступний елемент галереї"
              onClick={() => setI((v) => (v + 1) % galleryItemCount)}
            >
              ›
            </button>
            <div className="gallery-dots">
              <button
                type="button"
                className={i === 0 ? "is-active" : ""}
                aria-label="Відеоогляд клініки DENTIX"
                aria-current={i === 0 ? "true" : undefined}
                onClick={() => setI(0)}
              />
              {aboutSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={idx + 1 === i ? "is-active" : ""}
                  aria-label={`Фото ${idx + 1}`}
                  aria-current={idx + 1 === i ? "true" : undefined}
                  onClick={() => setI(idx + 1)}
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
