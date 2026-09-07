import { useEffect, useMemo, useState } from "react";

import { getIntakeStatus, type IntakeStatus } from "@/lib/intake-status";

type ContactMethod = "PHONE" | "TELEGRAM" | "VIBER" | "WHATSAPP";
type LeadFormProps = { sourceSite: "CANONICAL_CANDIDATE" | "PUBLIC_DEMO" };

const labels: Record<ContactMethod, string> = {
  PHONE: "Телефонний дзвінок",
  TELEGRAM: "Telegram",
  VIBER: "Viber",
  WHATSAPP: "WhatsApp",
};

const endpoint = import.meta.env.VITE_DENTIX_LEADS_API_URL?.trim() ?? "";
const configuredMethods = (import.meta.env.VITE_DENTIX_LEAD_CONTACT_METHODS ?? "PHONE,TELEGRAM,VIBER,WHATSAPP")
  .split(",").map((value) => value.trim()).filter((value): value is ContactMethod => value in labels);

export function LeadForm({ sourceSite }: LeadFormProps) {
  const methods = useMemo(() => configuredMethods.length ? configuredMethods : ["PHONE"] as ContactMethod[], []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<ContactMethod>(methods[0]!);
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [readiness, setReadiness] = useState<IntakeStatus | null>(null);
  const [readinessState, setReadinessState] = useState<"loading" | "ready" | "error">("loading");
  const [readinessAttempt, setReadinessAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setReadinessState("loading");
    void getIntakeStatus().then((value) => { if (active) { setReadiness(value); setReadinessState("ready"); } }).catch(() => { if (active) setReadinessState("error"); });
    return () => { active = false; };
  }, [readinessAttempt]);
  const privacyUrl = readiness?.lead.policyUrl;
  const enabled = Boolean(endpoint && readinessState === "ready" && readiness?.lead.enabled && privacyUrl);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!enabled || !consent || state === "sending") return;
    setState("sending");
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          name,
          phone,
          preferred_contact: preferredContact,
          comment,
          consent,
          website,
          source_site: sourceSite,
          source_path: window.location.pathname,
          source_cta: "CONTACT_LEAD_FORM",
          consent_version: readiness?.lead.consentVersion,
          idempotency_key: idempotencyKey,
        }),
      });
      const payload = await response.json() as { data?: { message?: string }; error?: { message?: string } };
      if (!response.ok || !payload.data?.message) throw new Error(payload.error?.message ?? "SUBMIT_FAILED");
      setMessage(payload.data.message);
      setState("success");
      setName("");
      setPhone("");
      setComment("");
      setConsent(false);
      setIdempotencyKey(crypto.randomUUID());
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error && !(error instanceof TypeError) && error.message !== "SUBMIT_FAILED" ? error.message : "Заявку не надіслано. Зателефонуйте клініці або спробуйте пізніше.");
    }
  }

  return <form className="lead-form" onSubmit={submit}>
    <div className="lead-fields">
      <label><span>Ім’я *</span><input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше ім’я" /></label>
      <label><span>Телефон *</span><input type="tel" required inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+380 XX XXX XX XX" /></label>
      <label className="lead-field-wide"><span>Бажаний спосіб зв’язку *</span><select required value={preferredContact} onChange={(event) => setPreferredContact(event.target.value as ContactMethod)}>{methods.map((method) => <option key={method} value={method}>{labels[method]}</option>)}</select></label>
      <label className="lead-field-wide"><span>Побажання або коментар</span><textarea maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Коротко опишіть організаційне питання — без медичних даних" /></label>
    </div>
    <label className="lead-honeypot" aria-hidden="true"><span>Website</span><input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
    <label className="lead-consent"><input type="checkbox" required disabled={!enabled} checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Погоджуюся на обробку контактних даних для відповіді на заявку. {privacyUrl ? <a href={privacyUrl} target="_blank" rel="noreferrer">Політика конфіденційності</a> : null}</span></label>
    <button className="btn btn-block" type="submit" disabled={!enabled || state === "sending" || !consent}>{state === "sending" ? "Надсилаємо…" : "Залишити заявку"}</button>
    {!enabled ? <p className="lead-form-state error" role="status">{readinessState === "loading" ? "Перевіряємо доступність форми…" : readinessState === "error" ? "Не вдалося перевірити доступність форми. Спробуйте ще раз або зателефонуйте до клініки." : "Форма ще не активована. Скористайтеся телефоном або Instagram."}</p> : null}
    {readinessState === "error" ? <button className="btn btn-block" type="button" onClick={() => setReadinessAttempt((value) => value + 1)}>Перевірити ще раз</button> : null}
    {message ? <p className={`lead-form-state ${state}`} role={state === "error" ? "alert" : "status"}>{message}</p> : null}
  </form>;
}
