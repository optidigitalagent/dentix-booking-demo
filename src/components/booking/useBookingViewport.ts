import { useEffect, type RefObject } from "react";

// Local to the dialog. Pinch zoom is deliberately left to the browser.
export function useBookingViewport(open: boolean, panelRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const layer = panel?.parentElement;
    const viewport = window.visualViewport;
    if (!panel || !layer || !viewport) return;
    const update = () => {
      if (Math.abs(viewport.scale - 1) > 0.02) return;
      layer.style.setProperty("--booking-visible-height", `${viewport.height}px`);
      layer.style.setProperty("--booking-visible-top", `${viewport.offsetTop}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      layer.style.removeProperty("--booking-visible-height");
      layer.style.removeProperty("--booking-visible-top");
    };
  }, [open, panelRef]);
}
