import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, LockKeyhole, X } from "lucide-react";
import { bookingClient } from "@/lib/demo-booking-client";
import { isPatientBookingDetailsValid } from "@/lib/booking-validation";
import { bookingModeLabel, isExactMapping } from "@/lib/booking-modes";
import type {
  AvailabilityDay,
  BookingCatalog,
  BookingConfirmation,
} from "@/lib/booking-types";
import { LeadForm } from "../LeadForm";
import { getIntakeStatus, type IntakeStatus } from "@/lib/intake-status";
import { useBookingViewport } from "./useBookingViewport";
import { useBooking } from "./BookingContext";

const stepLabels = ["Послуга", "Лікар", "Дата і час", "Ваші дані", "Перевірка"];

export function BookingDrawer() {
  const { isOpen, closeBooking, seed } = useBooking();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(0);
  const [readiness, setReadiness] = useState<IntakeStatus | null>(null);
  useBookingViewport(isOpen, panelRef);
  const [catalog, setCatalog] = useState<BookingCatalog | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const idempotencyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const ownedStyles = { overflow: "hidden", position: "fixed", top: `-${scroll.y}px`, left: `-${scroll.x}px`, width: "100%" };
    const previousStyles = Object.fromEntries(Object.keys(ownedStyles).map((key) => [key, body.style.getPropertyValue(key)]));
    for (const [key, value] of Object.entries(ownedStyles)) body.style.setProperty(key, value);
    const appliedStyles = Object.fromEntries(Object.keys(ownedStyles).map((key) => [key, body.style.getPropertyValue(key)]));
    let active = true;
    setCatalog(null);
    setReadiness(null);
    setStep(seed.serviceId || seed.doctorId ? 0 : 0);
    setServiceId(seed.serviceId ?? "");
    setDoctorId(seed.doctorId ?? "");
    setStartsAt("");
    setSelectedDate("");
    idempotencyRef.current = crypto.randomUUID();
    setConfirmation(null);
    setName("");
    setPhone("");
    setConsent(false);
    setError("");
    setLoading(true);
    getIntakeStatus()
      .then(async (status) => {
        if (!active) return;
        setReadiness(status);
        if (status.timed.enabled && status.timed.policyUrl && !seed.requestedInterest) {
          const value = await bookingClient.getCatalog();
          if (active && !value.testOnly && value.mode === "LIVE_REQUESTS_READY" && value.services.length) {
            setCatalog(value);
          }
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error && !(reason instanceof TypeError) ? reason.message : "Онлайн-запис тимчасово недоступний.");
      })
      .finally(() => { if (active) setLoading(false); });
    const timer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBooking();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), a[href]'
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
      active = false;
      for (const [key, value] of Object.entries(appliedStyles)) {
        if (body.style.getPropertyValue(key) === value) body.style.setProperty(key, previousStyles[key] ?? "");
      }
      // Restore the page location captured on open; never reset the user's zoom.
      if (body.style.position !== "fixed") window.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
      previousFocus?.focus({ preventScroll: true });
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [closeBooking, isOpen, seed.doctorId, seed.serviceId, seed.requestedInterest]);

  useEffect(() => {
    if (!serviceId || !doctorId || !selectedDate || !isOpen) return;
    setLoading(true);
    let active = true;
    setError("");
    setAvailability([]);
    setStartsAt("");
    bookingClient
      .getAvailability(serviceId, doctorId, selectedDate)
      .then((value) => { if (active) setAvailability(value); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error && !(reason instanceof TypeError) ? reason.message : "Не вдалося завантажити час.");
      })
      .finally(() => { if (active) setLoading(false); });
    const refresh = () => bookingClient.getAvailability(serviceId, doctorId, selectedDate).then((value) => { if (active) setAvailability(value); }).catch(() => undefined);
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [doctorId, isOpen, selectedDate, serviceId]);

  const doctors = useMemo(
    () => catalog?.doctors.filter((doctor) => catalog.doctorServices.some((link) => link.service_id === serviceId && link.doctor_id === doctor.id && isExactMapping(link))) ?? [],
    [catalog, serviceId],
  );
  const service = catalog?.services.find((item) => item.id === serviceId);
  const doctor = catalog?.doctors.find((item) => item.id === doctorId);
  const mapping = catalog?.doctorServices.find((item) => item.service_id === serviceId && item.doctor_id === doctorId && isExactMapping(item));
  const callbackOnly = Boolean(service && doctors.length === 0);
  const callbackView = callbackOnly && step > 0;
  const consultation = mapping?.booking_mode === "CONSULTATION_SLOT";
  const selectedSlot = availability.flatMap((day) => day.slots).find((slot) => slot.startsAt === startsAt);
  useEffect(() => {
    if (!startsAt || selectedSlot || loading || confirmation) return;
    setStartsAt("");
    setStep(2);
    setError("Обраний інтервал уже недоступний. Ваші контактні дані збережено; оберіть інший час.");
  }, [startsAt, selectedSlot, loading, confirmation]);

  const canContinue =
    (step === 0 && Boolean(service)) ||
    (step === 1 && doctors.some((item) => item.id === doctorId)) ||
    (step === 2 && Boolean(selectedSlot && mapping)) ||
    (step === 3 && isPatientBookingDetailsValid({ name, phone, consent })) ||
    (step === 4 && Boolean(mapping && selectedSlot));

  async function submit() {
    if (!service || !doctor || !mapping || !selectedSlot || !startsAt || !consent || !readiness?.timed.enabled || !readiness.timed.policyUrl) return;
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
        idempotencyKey: idempotencyRef.current,
        consentVersion: readiness?.timed.consentVersion ?? "",
      });
      setConfirmation(result);
    } catch (reason) {
      if (reason instanceof Error && "code" in reason && (reason as { code?: string }).code === "SLOT_NO_LONGER_AVAILABLE") {
        setStartsAt("");
        setStep(2);
        if (selectedDate) void bookingClient.getAvailability(serviceId, doctorId, selectedDate).then(setAvailability).catch(() => undefined);
      }
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
            <p className="booking-kicker">DENTIX · {consultation ? "запит на консультацію" : "запит на запис"}</p>
            <h2 id="booking-title">{confirmation ? "Запит отримано" : callbackView || (!catalog && !loading) ? "Залишити заявку" : stepLabels[step]}</h2>
          </div>
          <button ref={closeRef} className="booking-icon-button" onClick={closeBooking} aria-label="Закрити">
            <X size={20} />
          </button>
        </header>


        {!confirmation && catalog && !callbackView ? (
          <div className="booking-progress" aria-label={`Крок ${step + 1} з ${stepLabels.length}`}>
            <span style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }} />
          </div>
        ) : null}

        <div className="booking-body">
          {loading && !catalog ? <p className="booking-state">Завантажуємо безпечний запис…</p> : null}
          {error ? <div className="booking-error" role="alert">{error}</div> : null}

          {!loading && !catalog ? <section className="booking-fallback">{seed.requestedInterest ? <p>Цікавить: <strong>{seed.requestedInterest}</strong>.</p> : null}<p>Залиште заявку — адміністратор уточнить послугу та зручний час.</p><p className="booking-privacy-note">Заявка не резервує час прийому.</p><LeadForm key={seed.requestedInterest ?? "general"} sourceSite="PUBLIC_DEMO" requestedInterest={seed.requestedInterest} /></section> : null}
          {!confirmation && callbackView ? <section className="booking-fallback"><p>Цікавить: <strong>{service?.name}</strong>.</p><p>Адміністратор зателефонує, щоб уточнити деталі. Заявка не резервує час і не підтверджує процедуру.</p><LeadForm key={serviceId} sourceSite="PUBLIC_DEMO" requestedInterest={service?.name} /><button className="booking-secondary" onClick={() => setStep(0)}><ChevronLeft size={18} /> До вибору послуги</button></section> : null}
          {confirmation ? (
            <section className="booking-confirmation">
              <span className="booking-success-mark"><Check size={28} /></span>
              <p className="booking-kicker">Очікує дзвінка</p>
              <h3>{confirmation.reference}</h3>
              <p>{confirmation.message}</p>
              <dl className="booking-summary">
                <div><dt>Цікавить</dt><dd>{confirmation.requestedServiceName || service?.name}</dd></div>
                <div><dt>Тип прийому</dt><dd>{confirmation.scheduledServiceName || mapping?.scheduled_service_name || service?.name}</dd></div>
                <div><dt>Лікар</dt><dd>{doctor?.name}</dd></div>
                <div><dt>Інтервал</dt><dd>{formatDateTime(confirmation.startsAt)}–{formatTime(confirmation.endsAt)}</dd></div>
                <div><dt>Статус</dt><dd>Очікує дзвінка</dd></div>
              </dl>
              <p className="booking-privacy-note">Інтервал тимчасово утримується до узгодження з адміністратором. {consultation ? "Це запит на консультацію; лікування ще не заброньовано. " : "Прийом ще не підтверджено. "}Адміністратор DENTIX зателефонує, щоб уточнити деталі.</p>
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
                  <em>{(() => { const modes = [...new Set(catalog.doctorServices.filter((link) => link.service_id === item.id && isExactMapping(link)).map((link) => link.booking_mode))]; return modes.length === 1 ? bookingModeLabel(modes[0]!) : modes.length ? "Тип прийому залежить від лікаря" : bookingModeLabel("CALLBACK_ONLY"); })()}</em>
                </button>
              ))}
            </div>
          ) : null}

          {!confirmation && catalog && !callbackView && step === 1 ? (
            <div className="booking-options">
              {doctors.map((item) => (
                <button
                  key={item.id}
                  className={`booking-option${doctorId === item.id ? " selected" : ""}`}
                  onClick={() => setDoctorId(item.id)}
                >
                  <span><strong>{item.name}</strong><small>{item.role}</small><small>{catalog.doctorServices.find((link) => link.service_id === serviceId && link.doctor_id === item.id)?.scheduled_service_name}</small></span>
                </button>
              ))}
            </div>
          ) : null}

          {!confirmation && catalog && step === 2 ? (
            <div className="booking-calendar-list">
              <label className="booking-date-field"><span>Дата (Europe/Kyiv)</span><input type="date" min={catalog.minDate} max={catalog.maxDate} value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setStartsAt(""); }} /></label>
              <p className="booking-privacy-note">{consultation ? "Оберіть бажаний час консультації. Це не запис на саму процедуру. " : "Оберіть бажаний час прийому. "}Тип прийому: {mapping?.scheduled_service_name}. Тривалість: {mapping?.reservation_duration_minutes} хв. Доступність оновлюється кожні 30 секунд.</p>
              {loading ? <p className="booking-state">Перевіряємо доступність…</p> : null}
              {!loading && selectedDate && availability.every((day) => day.slots.length === 0) ? <p className="booking-state">На цю дату немає доступних інтервалів.</p> : null}
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
              <label><span>Ім’я *</span><input type="text" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ваше ім’я" /></label>
              <label><span>Телефон *</span><input type="tel" required maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="+380 __ ___ __ __" /></label>
              <label className="booking-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Погоджуюся на обробку контактних даних для створення та адміністрування запису. {readiness?.timed.policyUrl ? <a href={readiness.timed.policyUrl} target="_blank" rel="noreferrer">Політика конфіденційності</a> : null}</span>
              </label>
              <p className="booking-privacy-note"><LockKeyhole size={14} /> Діагноз, медична історія й документи тут не збираються.</p>
            </div>
          ) : null}

          {!confirmation && catalog && step === 4 ? (
            <section className="booking-review">
              <p>Перевірте дані перед надсиланням запиту.</p>
              <dl className="booking-summary">
                <div><dt>Цікавить</dt><dd>{service?.name}</dd></div>
                <div><dt>Тип прийому</dt><dd>{mapping?.scheduled_service_name}</dd></div>
                <div><dt>Лікар</dt><dd>{doctor?.name}</dd></div>
                <div><dt>Інтервал</dt><dd>{selectedSlot ? `${formatDateTime(selectedSlot.startsAt)}–${formatTime(selectedSlot.endsAt)}` : "—"}</dd></div>
                <div><dt>Ім’я</dt><dd>{name}</dd></div>
                <div><dt>Телефон</dt><dd>{phone}</dd></div>
                <div><dt>Часовий пояс</dt><dd>{catalog.clinicTimezone}</dd></div>
              </dl>
            </section>
          ) : null}
        </div>

        {!confirmation && catalog && !callbackView ? (
          <footer className="booking-footer">
            <button className="booking-secondary" disabled={step === 0 || loading} onClick={() => setStep((value) => Math.max(0, value - 1))}>
              <ChevronLeft size={18} /> Назад
            </button>
            {step < 4 ? (
              <button className="booking-primary" disabled={!canContinue || loading} onClick={() => setStep((value) => value + 1)}>Далі</button>
            ) : (
              <button className="booking-primary" disabled={loading || !canContinue} onClick={submit}>{loading ? "Надсилаємо…" : "Надіслати запит"}</button>
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
function formatTime(value: string) { return new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Kyiv" }).format(new Date(value)); }
