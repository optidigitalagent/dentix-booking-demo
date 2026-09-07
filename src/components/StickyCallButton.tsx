import { site } from "@/data/site";
import { siteHref } from "@/lib/site-href";
import { useEffect, useState } from "react";

export function StickyCallButton() {
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(Boolean(entry?.isIntersecting)));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  if (footerVisible) return null;
  if (!site.contactDataReady) {
    return (
      <a className="mobile-call-bar" href={siteHref("/#contact")}>
        <span aria-hidden="true">↘</span>
        Контакти
      </a>
    );
  }

  return (
    <a className="mobile-call-bar" href={site.phonePrimaryHref}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />
      </svg>
      Зателефонувати
    </a>
  );
}
