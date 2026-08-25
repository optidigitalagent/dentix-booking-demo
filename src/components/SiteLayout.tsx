import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyCallButton } from "./StickyCallButton";
import { BookingProvider } from "./booking/BookingContext";
import { BookingDrawer } from "./booking/BookingDrawer";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <Header />
      <main id="top">{children}</main>
      <Footer />
      <StickyCallButton />
      <BookingDrawer />
    </BookingProvider>
  );
}
