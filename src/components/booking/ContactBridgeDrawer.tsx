import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useBooking } from "./BookingContext";
import { ContactActions } from "./ContactActions";
import { useBookingViewport } from "./useBookingViewport";

export function ContactBridgeDrawer() {
  const { isOpen, closeBooking, seed, returnFocusRef } = useBooking();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useBookingViewport(isOpen, panelRef);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const ownedStyles = { overflow: "hidden", position: "fixed", top: `-${scroll.y}px`, left: `-${scroll.x}px`, width: "100%" };
    const previousStyles = Object.fromEntries(Object.keys(ownedStyles).map((key) => [key, body.style.getPropertyValue(key)]));
    for (const [key, value] of Object.entries(ownedStyles)) body.style.setProperty(key, value);
    const appliedStyles = Object.fromEntries(Object.keys(ownedStyles).map((key) => [key, body.style.getPropertyValue(key)]));
    const timer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBooking();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? current <= 0 ? focusable.length - 1 : current - 1
        : current < 0 || current === focusable.length - 1 ? 0 : current + 1;
      event.preventDefault();
      focusable[next]?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      for (const [key, value] of Object.entries(appliedStyles)) {
        if (body.style.getPropertyValue(key) === value) body.style.setProperty(key, previousStyles[key] ?? "");
      }
      if (body.style.position !== "fixed") window.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
      const trigger = returnFocusRef.current?.closest("#nav-mobile")
        ? document.querySelector<HTMLElement>(".nav-burger")
        : returnFocusRef.current;
      const returnFocus = trigger?.isConnected && trigger.getClientRects().length
        ? trigger
        : previousFocus !== document.body && previousFocus !== document.documentElement && previousFocus?.isConnected && previousFocus.getClientRects().length
          ? previousFocus
          : document.querySelector<HTMLElement>(".nav-burger");
      returnFocus?.focus({ preventScroll: true });
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [closeBooking, isOpen, returnFocusRef]);

  if (!isOpen) return null;
  return (
    <div className="booking-layer" role="presentation">
      <button className="booking-backdrop" type="button" aria-label="Закрити вікно зв’язку" onClick={closeBooking} />
      <div className="booking-drawer contact-bridge-drawer" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <header className="booking-head">
          <div>
            <p className="booking-kicker">DENTIX · зв’язок з клінікою</p>
            <h2 id="booking-title">Зв’язатися для запису</h2>
          </div>
          <button ref={closeRef} className="booking-icon-button" type="button" onClick={closeBooking} aria-label="Закрити">
            <X size={20} />
          </button>
        </header>
        <div className="booking-body"><ContactActions requestedInterest={seed.requestedInterest} /></div>
      </div>
    </div>
  );
}
