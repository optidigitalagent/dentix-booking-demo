import { useMemo, useState } from "react";

type ContactMethod = "PHONE" | "TELEGRAM" | "VIBER" | "WHATSAPP";
type LeadFormProps = { sourceSite: "CANONICAL_CANDIDATE" | "PUBLIC_DEMO" };

const labels: Record<ContactMethod, string> = {
  PHONE: "Телефонний дзвінок",
  TELEGRAM: "Telegram",
  VIBER: "Viber",
  WHATSAPP: "WhatsApp",
};

const endpoint = import.meta.env.VITE_DENTIX_LEADS_API_URL?.trim() ?? "";
const testMode = import.meta.env.VITE_DENTIX_LEAD_TEST_MODE === "true";
const privacyUrl = import.meta.env.VITE_DENTIX_PRIVACY_POLICY_URL?.trim() ?? "";
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
  const enabled = Boolean(endpoint && (testMode || privacyUrl));

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
          test_submission: testMode,
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
      setMessage(error instanceof Error && error.message !== "SUBMIT_FAILED" ? error.message : "Заявку не надіслано. Зателефонуйте клініці або спробуйте пізніше.");
    }
  }

  return <form className="lead-form" onSubmit={submit}>
    {testMode ? <div className="lead-test-banner" role="note"><strong>TEST-форма</strong><span>Не вводьте реальні дані пацієнта. Ім’я має починатися з TEST.</span></div> : null}
    <div className="lead-fields">
      <label><span>Ім’я *</span><input required minLength={2} maxLength={120} pattern={testMode ? "^TEST.*" : undefined} title={testMode ? "Тестове ім’я має починатися з TEST" : undefined} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={testMode ? "TEST · Ім’я" : "Ваше ім’я"} /></label>
      <label><span>Телефон *</span><input required inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={testMode ? "+380000000000" : "+380 XX XXX XX XX"} /></label>
      <label className="lead-field-wide"><span>Бажаний спосіб зв’язку *</span><select required value={preferredContact} onChange={(event) => setPreferredContact(event.target.value as ContactMethod)}>{methods.map((method) => <option key={method} value={method}>{labels[method]}</option>)}</select></label>
      <label className="lead-field-wide"><span>Побажання або коментар</span><textarea maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Коротко опишіть організаційне питання — без медичних даних" /></label>
    </div>
    <label className="lead-honeypot" aria-hidden="true"><span>Website</span><input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
    <label className="lead-consent"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>{testMode ? "Підтверджую, що використовую лише вигадані TEST-дані." : <>Погоджуюся на обробку контактних даних для відповіді на заявку. <a href={privacyUrl} target="_blank" rel="noreferrer">Політика конфіденційності</a>.</>}</span></label>
    <button className="btn btn-block" type="submit" disabled={!enabled || state === "sending" || !consent}>{state === "sending" ? "Надсилаємо…" : "Залишити заявку"}</button>
    {!enabled ? <p className="lead-form-state error" role="status">Форма ще не активована. Скористайтеся телефоном або Instagram.</p> : null}
    {message ? <p className={`lead-form-state ${state}`} role={state === "error" ? "alert" : "status"}>{message}</p> : null}
  </form>;
}
