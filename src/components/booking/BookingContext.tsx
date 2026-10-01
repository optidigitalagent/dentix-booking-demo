import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type BookingSeed = { serviceId?: string | undefined; doctorId?: string | undefined; requestedInterest?: string | undefined };

type BookingContextValue = {
  isOpen: boolean;
  seed: BookingSeed;
  openBooking: (seed?: BookingSeed, trigger?: HTMLElement) => void;
  closeBooking: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [seed, setSeed] = useState<BookingSeed>({});
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openBooking = useCallback((nextSeed: BookingSeed = {}, trigger?: HTMLElement) => {
    returnFocusRef.current = trigger ?? null;
    setSeed(nextSeed);
    setIsOpen(true);
  }, []);
  const closeBooking = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, seed, openBooking, closeBooking, returnFocusRef }),
    [closeBooking, isOpen, openBooking, seed],
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used inside BookingProvider");
  return context;
}

export function BookingButton({
  className,
  children = "Записатися",
  serviceId,
  doctorId,
  requestedInterest,
  onClick,
}: {
  className?: string;
  children?: React.ReactNode;
  serviceId?: string | undefined;
  doctorId?: string | undefined;
  requestedInterest?: string | undefined;
  onClick?: () => void;
}) {
  const { openBooking } = useBooking();
  return (
    <button className={className} type="button" data-booking-cta onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); openBooking({ serviceId, doctorId, requestedInterest }, event.currentTarget); onClick?.(); }}>
      {children}
    </button>
  );
}
