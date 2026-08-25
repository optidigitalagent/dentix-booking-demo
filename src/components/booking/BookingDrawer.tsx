import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, LockKeyhole, X } from "lucide-react";
import { bookingClient } from "@/lib/demo-booking-client";
import { isPatientBookingDetailsValid } from "@/lib/booking-validation";
import type {
  AvailabilityDay,
  BookingCatalog,
  BookingConfirmation,
} from "@/lib/booking-types";
import { useBooking } from "./BookingContext";

const stepLabels = ["Послуга", "Лікар", "Дата і час", "Ваші дані", "Перевірка"];

export function BookingDrawer() {
  const { isOpen, closeBooking, seed } = useBooking();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(0);
  const [catalog, setCatalog] = useState<BookingCatalog | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setStep(seed.serviceId || seed.doctorId ? 0 : 0);
    setServiceId(seed.serviceId ?? "");
    setDoctorId(seed.doctorId ?? "");
    setStartsAt("");
    setName("");
    setPhone("");
    setConsent(false);
    setConfirmation(null);
    setError("");
    setLoading(true);
    bookingClient
      .getCatalog()
      .then(setCatalog)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Онлайн-запис тимчасово недоступний."),
      )
      .finally(() => setLoading(false));
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBooking();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href]'
      )];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [closeBooking, isOpen, seed.doctorId, seed.serviceId]);

  useEffect(() => {
    if (!serviceId || !doctorId || !isOpen) return;
    setLoading(true);
    setAvailability([]);
    setStartsAt("");
    bookingClient
      .getAvailability(serviceId, doctorId)
      .then(setAvailability)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Не вдалося завантажити час."),
      )
      .finally(() => setLoading(false));
  }, [doctorId, isOpen, serviceId]);

  const doctors = useMemo(
    () => catalog?.doctors.filter((doctor) => !serviceId || doctor.serviceIds.includes(serviceId)) ?? [],
    [catalog, serviceId],
  );
  const service = catalog?.services.find((item) => item.id === serviceId);
  const doctor = catalog?.doctors.find((item) => item.id === doctorId);
  const selectedSlot = availability.flatMap((day) => day.slots).find((slot) => slot.startsAt === startsAt);

  const canContinue =
    (step === 0 && Boolean(serviceId)) ||
    (step === 1 && Boolean(doctorId)) ||
    (step === 2 && Boolean(startsAt)) ||
    (step === 3 && isPatientBookingDetailsValid({ name, phone, consent })) ||
    step === 4;

  async function submit() {
    if (!service || !doctor || !startsAt || !consent) return;
    setLoading(true);
    setError("");
    try {
      const result = await bookingClient.createAppointment({
        serviceId,
        doctorId,
        startsAt,
        name: name.trim(),
        phone: phone.trim(),
        consent: true,
        idempotencyKey: crypto.randomUUID(),
      });
      setConfirmation(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося створити запис.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="booking-layer" role="presentation">
      <button className="booking-backdrop" aria-label="Закрити онлайн-запис" onClick={closeBooking} />
      <div
        className="booking-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        <header className="booking-head">
          <div>
            <p className="booking-kicker">DENTIX · демонстраційний онлайн-запис</p>
            <h2 id="booking-title">{confirmation ? "Демо-запит створено" : stepLabels[step]}</h2>
          </div>
          <button ref={closeRef} className="booking-icon-button" onClick={closeBooking} aria-label="Закрити">
            <X size={20} />
          </button>
        </header>

        {catalog?.environment === "development" ? (
          <div className="booking-demo-flag" role="status">
            Демонстраційний режим · локальні дані, нічого не надсилається до клініки
          </div>
        ) : null}

        {!confirmation ? (
          <div className="booking-progress" aria-label={`Крок ${step + 1} з ${stepLabels.length}`}>
            <span style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }} />
          </div>
        ) : null}

        <div className="booking-body">
          {loading && !catalog ? <p className="booking-state">Завантажуємо безпечний запис…</p> : null}
          {error ? <div className="booking-error" role="alert">{error}</div> : null}

          {confirmation ? (
            <section className="booking-confirmation">
              <span className="booking-success-mark"><Check size={28} /></span>
              <p className="booking-kicker">Демонстраційне підтвердження</p>
              <h3>{confirmation.reference}</h3>
              <dl className="booking-summary">
                <div><dt>Послуга</dt><dd>{confirmation.service}</dd></div>
                <div><dt>Лікар</dt><dd>{confirmation.doctor}</dd></div>
                <div><dt>Дата і час</dt><dd>{formatDateTime(confirmation.startsAt)}</dd></div>
                <div><dt>Часовий пояс</dt><dd>{confirmation.clinicTimezone}</dd></div>
                <div><dt>Google Calendar</dt><dd>Не підключено · DEMO</dd></div>
              </dl>
              <p className="booking-privacy-note">Це лише preview: запис не збережено в CRM, SMS та email не надсилаються.</p>
              <button className="booking-primary" onClick={closeBooking}>Готово</button>
            </section>
          ) : null}

          {!confirmation && catalog && step === 0 ? (
            <div className="booking-options">
              {catalog.services.map((item) => (
                <button
                  key={item.id}
                  className={`booking-option${serviceId === item.id ? " selected" : ""}`}
                  onClick={() => { setServiceId(item.id); setDoctorId(""); }}
                >
                  <span><strong>{item.name}</strong><small>{item.category}</small></span>
                  <em>{item.durationMinutes} хв</em>
                </button>
              ))}
            </div>
          ) : null}

          {!confirmation && catalog && step === 1 ? (
            <div className="booking-options">
              {doctors.map((item) => (
                <button
                  key={item.id}
                  className={`booking-option${doctorId === item.id ? " selected" : ""}`}
                  onClick={() => setDoctorId(item.id)}
                >
                  <span><strong>{item.name}</strong><small>{item.role}</small></span>
                  {item.demo ? <em>DEMO</em> : null}
                </button>
              ))}
            </div>
          ) : null}

          {!confirmation && catalog && step === 2 ? (
            <div className="booking-calendar-list">
              {loading ? <p className="booking-state">Перевіряємо доступність…</p> : null}
              {!loading && availability.length === 0 ? <p className="booking-state">Немає доступних слотів.</p> : null}
              {availability.map((day) => (
                <section key={day.date} className="booking-day">
                  <h3>{day.label}</h3>
                  <div className="booking-slots">
                    {day.slots.map((slot) => (
                      <button
                        key={slot.startsAt}
                        className={startsAt === slot.startsAt ? "selected" : ""}
                        onClick={() => setStartsAt(slot.startsAt)}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {!confirmation && catalog && step === 3 ? (
            <div className="booking-form">
              <label><span>Ім’я *</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ваше ім’я" /></label>
              <label><span>Телефон *</span><input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="+380 __ ___ __ __" /></label>
              <label className="booking-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Погоджуюся на обробку контактних даних для створення та адміністрування запису.</span>
              </label>
              <p className="booking-privacy-note"><LockKeyhole size={14} /> Діагноз, медична історія й документи тут не збираються.</p>
            </div>
          ) : null}

          {!confirmation && catalog && step === 4 ? (
            <section className="booking-review">
              <p>Перевірте демонстраційні дані. Після підтвердження вони не залишать цей браузер.</p>
              <dl className="booking-summary">
                <div><dt>Послуга</dt><dd>{service?.name}</dd></div>
                <div><dt>Лікар</dt><dd>{doctor?.name}</dd></div>
                <div><dt>Дата і час</dt><dd>{selectedSlot ? formatDateTime(selectedSlot.startsAt) : "—"}</dd></div>
                <div><dt>Ім’я</dt><dd>{name}</dd></div>
                <div><dt>Телефон</dt><dd>{phone}</dd></div>
                <div><dt>Часовий пояс</dt><dd>{catalog.clinicTimezone}</dd></div>
              </dl>
            </section>
          ) : null}
        </div>

        {!confirmation && catalog ? (
          <footer className="booking-footer">
            <button className="booking-secondary" disabled={step === 0 || loading} onClick={() => setStep((value) => Math.max(0, value - 1))}>
              <ChevronLeft size={18} /> Назад
            </button>
            {step < 4 ? (
              <button className="booking-primary" disabled={!canContinue || loading} onClick={() => setStep((value) => value + 1)}>Далі</button>
            ) : (
              <button className="booking-primary" disabled={loading} onClick={submit}>{loading ? "Створюємо…" : "Підтвердити запис"}</button>
            )}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Kyiv",
  }).format(new Date(value));
}
