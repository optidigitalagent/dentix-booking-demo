import { createRoot } from "react-dom/client";
import { BookingProvider, BookingButton } from "./components/booking/BookingContext";
import { BookingDrawer } from "./components/booking/BookingDrawer";
import "./patient.css";

createRoot(document.getElementById("root")!).render(<BookingProvider><main style={{ padding: "2rem" }}><h1>DENTIX · TEST_READY</h1><p>Авторизована перевірка існуючої форми. Лише вигадані дані та TEST-ресурси.</p><BookingButton className="booking-primary">Перевірити запис</BookingButton><p><a href="/">Повернутися до CRM</a></p></main><BookingDrawer /></BookingProvider>);
