import { Brand } from "./Brand";
import { site } from "@/data/site";
import { siteHref } from "@/lib/site-href";
import { BookingButton } from "./booking/BookingContext";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <div className="footer-brand-col">
          <Brand variant="footer" />
          <p className="footer-tagline">
            Стоматологія повного циклу DENTIX: лікування, ортодонтія, імплантація та відновлення
            усмішки.
          </p>
          <BookingButton className="footer-booking">Записатися онлайн</BookingButton>
        </div>
        <div className="footer-contact">
          <div className="footer-contact-item">
            <span className="footer-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span>
              {site.address}
              <br />
              {site.city}
            </span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />
              </svg>
            </span>
            <span>
              {site.contactDataReady ? (
                <a href={site.phonePrimaryHref}>{site.phonePrimary}</a>
              ) : (
                site.phonePrimary
              )}
              <br />
              {site.contactDataReady ? (
                <a href={site.phoneSecondaryHref}>{site.phoneSecondary}</a>
              ) : (
                site.phoneSecondary
              )}
            </span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <span>
              {site.schedule}
              <br />
              {site.scheduleNote}
            </span>
          </div>
        </div>
      </div>
      <div className="wrap footer-mini">
        <nav className="footer-links" aria-label="Меню у підвалі">
          {site.nav.map((item) => (
            <a key={item.label} href={siteHref(item.to)}>
              {item.label}
            </a>
          ))}
        </nav>
        <p className="footer-copy">© {new Date().getFullYear()} DENTIX</p>
      </div>
    </footer>
  );
}
