import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type LightboxItem = { src: string; label?: string };

export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const step = useCallback(
    (dir: number) => {
      if (index === null) return;
      onIndex((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose, step]);

  if (!open) return null;
  const item = items[index];
  if (!item) return null;


  return createPortal(
    <div
      className="lightbox open"
      role="dialog"
      aria-modal="true"
      aria-label="Перегляд зображення"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="lightbox-close"
        aria-label="Закрити"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
      <button
        className="lightbox-nav prev"
        aria-label="Попереднє"
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
      >
        ‹
      </button>
      <figure className="lightbox-gallery" onClick={(e) => e.stopPropagation()}>
        <img className="lightbox-shot" src={item.src} alt={item.label ?? "Перегляд зображення"} />
        {item.label ? <figcaption>{item.label}</figcaption> : null}
      </figure>
      <button
        className="lightbox-nav next"
        aria-label="Наступне"
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
      >
        ›
      </button>
    </div>,
    document.body,
  );
}
