import { createContext, useCallback, useContext, useMemo, useState } from "react";

type BookingSeed = { serviceId?: string | undefined; doctorId?: string | undefined };

type BookingContextValue = {
  isOpen: boolean;
  seed: BookingSeed;
  openBooking: (seed?: BookingSeed) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [seed, setSeed] = useState<BookingSeed>({});
  const openBooking = useCallback((nextSeed: BookingSeed = {}) => {
    setSeed(nextSeed);
    setIsOpen(true);
  }, []);
  const closeBooking = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, seed, openBooking, closeBooking }),
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
  children = "Записатися онлайн",
  serviceId,
  doctorId,
  onClick,
}: {
  className?: string;
  children?: React.ReactNode;
  serviceId?: string | undefined;
  doctorId?: string | undefined;
  onClick?: () => void;
}) {
  const { openBooking } = useBooking();
  return (
    <button className={className} type="button" onClick={() => { onClick?.(); openBooking({ serviceId, doctorId }); }}>
      {children}
    </button>
  );
}
