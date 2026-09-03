import { useEffect, useRef, useState } from "react";
import { Brand } from "./Brand";
import { site } from "@/data/site";
import { siteHref } from "@/lib/site-href";
import { BookingButton } from "./booking/BookingContext";

export function Header() {
  const isPricePage =
    typeof window !== "undefined" && /\/price\.html\/?$/.test(window.location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = open ? "hidden" : previousBodyOverflow;
    document.documentElement.style.overflow = open ? "hidden" : previousRootOverflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }

      if (event.key === "Tab" && open && mobileNavRef.current) {
        const focusable = [
          menuButtonRef.current,
          ...mobileNavRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        ].filter((item): item is HTMLElement => Boolean(item));
        const first = focusable[0];
        const last = focusable.at(-1);

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    const focusTimer = open
      ? window.setTimeout(
          () => mobileNavRef.current?.querySelector<HTMLAnchorElement>("a")?.focus(),
          40,
        )
      : undefined;
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      if (focusTimer) window.clearTimeout(focusTimer);
    };
  }, [open]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="wrap nav-inner">
        <Brand />
        <nav className="nav-links" aria-label="Головна навігація">
          {site.nav.map((item) => (
            <a key={item.label} href={siteHref(item.to)}>
              {item.label}
            </a>
          ))}
        </nav>
        <BookingButton className="btn nav-cta">Записатися онлайн</BookingButton>
        <button
          ref={menuButtonRef}
          className={`nav-burger${open ? " open" : ""}`}
          aria-label={open ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={open}
          aria-controls="nav-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        ref={mobileNavRef}
        className={`nav-mobile${open ? " open" : ""}`}
        id="nav-mobile"
        aria-label="Мобільна навігація"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        {isPricePage ? (
          <a href={siteHref("/")} onClick={() => setOpen(false)}>
            Головна
          </a>
        ) : null}
        {site.nav.map((item) => (
          <a key={item.label} href={siteHref(item.to)} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
        <BookingButton className="btn" onClick={() => setOpen(false)}>Записатися онлайн</BookingButton>
        {site.contactDataReady ? (
          <a className="nav-mobile-phone" href={site.phonePrimaryHref}>
            {site.phonePrimary}
          </a>
        ) : (
          <span className="nav-mobile-phone nav-mobile-placeholder">Контактні дані готуються</span>
        )}
      </nav>
    </header>
  );
}
