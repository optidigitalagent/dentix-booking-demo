import { type FormEvent, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  ContactRound,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";

type Section =
  | "overview"
  | "appointments"
  | "patients"
  | "doctors"
  | "services"
  | "schedule"
  | "google"
  | "settings";

type AppointmentStatus = "CONFIRMED" | "RESCHEDULED" | "CANCELLED";

type AppointmentRow = {
  id: string;
  startsAt: string;
  patient: string;
  phone: string;
  service: string;
  doctor: string;
  status: AppointmentStatus;
  sync: "NOT_CONNECTED";
};

const navigation: Array<{ id: Section; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Огляд", icon: LayoutDashboard },
  { id: "appointments", label: "Записи", icon: CalendarDays },
  { id: "patients", label: "Пацієнти", icon: ContactRound },
  { id: "doctors", label: "Лікарі", icon: Stethoscope },
  { id: "services", label: "Послуги", icon: Activity },
  { id: "schedule", label: "Розклад", icon: Clock3 },
  { id: "google", label: "Google Calendar", icon: RefreshCw },
  { id: "settings", label: "Налаштування", icon: Settings2 },
];

const initialAppointments: AppointmentRow[] = [
  {
    id: "DNTX-DEMO-A31C",
    startsAt: "2026-08-26T09:30",
    patient: "DEMO Пацієнт 01",
    phone: "+380 •• ••• •• 21",
    service: "DEMO Послуга 01 · Професійна гігієна",
    doctor: "DEMO Dentist 01",
    status: "CONFIRMED",
    sync: "NOT_CONNECTED",
  },
  {
    id: "DNTX-DEMO-F102",
    startsAt: "2026-08-26T11:00",
    patient: "DEMO Пацієнт 02",
    phone: "+380 •• ••• •• 84",
    service: "DEMO Послуга 03 · Консультація ортодонта",
    doctor: "DEMO Dentist 02",
    status: "CONFIRMED",
    sync: "NOT_CONNECTED",
  },
  {
    id: "DNTX-DEMO-82BF",
    startsAt: "2026-08-27T14:30",
    patient: "DEMO Пацієнт 03",
    phone: "+380 •• ••• •• 07",
    service: "DEMO Послуга 02 · Консультація терапевта",
    doctor: "DEMO Dentist 01",
    status: "CANCELLED",
    sync: "NOT_CONNECTED",
  },
];

export function AdminCrm() {
  const [section, setSection] = useState<Section>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const current = navigation.find((item) => item.id === section)!;
  const selected = appointments.find((item) => item.id === selectedId) ?? null;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function createAppointment(item: AppointmentRow) {
    setAppointments((currentRows) => [item, ...currentRows]);
    setCreating(false);
    setSection("appointments");
    showNotice("Демо-запис додано лише до пам’яті цієї сторінки.");
  }

  function rescheduleAppointment(startsAt: string) {
    if (!selected) return;
    setAppointments((currentRows) =>
      currentRows.map((item) =>
        item.id === selected.id ? { ...item, startsAt, status: "RESCHEDULED" } : item,
      ),
    );
    showNotice("Час змінено у локальному demo.");
  }

  function cancelAppointment() {
    if (!selected) return;
    setAppointments((currentRows) =>
      currentRows.map((item) =>
        item.id === selected.id ? { ...item, status: "CANCELLED" } : item,
      ),
    );
    showNotice("Запис скасовано лише у локальному demo.");
  }

  return (
    <div className="crm-shell">
      <aside className={`crm-sidebar${menuOpen ? " open" : ""}`}>
        <div className="crm-brand">
          <span>D</span>
          <div><strong>DENTIX</strong><small>OPERATIONS CRM</small></div>
        </div>
        <div className="crm-env">CLIENT DEMO · LOCAL DATA</div>
        <nav aria-label="CRM навігація">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={section === item.id ? "active" : ""}
                onClick={() => { setSection(item.id); setMenuOpen(false); }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {section === item.id ? <ChevronRight size={15} /> : null}
              </button>
            );
          })}
        </nav>
        <div className="crm-user">
          <span>DP</span>
          <div><strong>Demo Preview</strong><small>NO AUTH SESSION</small></div>
          <button aria-label="Про демо" onClick={() => showNotice("Цей preview не створює справжню admin-сесію.")}>
            <ShieldCheck size={16} />
          </button>
        </div>
      </aside>

      {menuOpen ? <button className="crm-mobile-overlay" aria-label="Закрити меню" onClick={() => setMenuOpen(false)} /> : null}

      <main className="crm-main">
        <header className="crm-topbar">
          <button
            className="crm-menu-button"
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div><p>DENTIX / {current.label}</p><h1>{current.label}</h1></div>
          <div className="crm-top-actions">
            <span className="crm-health warning"><i /> Демо · Google не подключён</span>
            <button className="crm-primary" onClick={() => setCreating(true)}>+ Новий запис</button>
          </div>
        </header>

        <div className="crm-demo-banner">
          <CircleAlert size={16} />
          Демонстраційний режим: тільки fixtures та пам’ять браузера. Реальні пацієнти, Supabase і Google Calendar не підключені.
        </div>

        <div className="crm-content">
          {section === "overview" ? <Overview rows={appointments} onOpenAppointments={() => setSection("appointments")} /> : null}
          {section === "appointments" ? <Appointments rows={appointments} onOpen={setSelectedId} /> : null}
          {section === "patients" ? <Patients /> : null}
          {section === "doctors" ? <Doctors /> : null}
          {section === "services" ? <Services /> : null}
          {section === "schedule" ? <Schedule /> : null}
          {section === "google" ? <GoogleCalendar /> : null}
          {section === "settings" ? <Settings /> : null}
        </div>
      </main>

      {creating ? <CreateAppointmentModal onClose={() => setCreating(false)} onCreate={createAppointment} /> : null}
      {selected ? (
        <AppointmentDetailModal
          appointment={selected}
          onClose={() => setSelectedId(null)}
          onReschedule={rescheduleAppointment}
          onCancel={cancelAppointment}
        />
      ) : null}
      {notice ? <div className="crm-toast" role="status">{notice}</div> : null}
    </div>
  );
}

function Overview({ rows, onOpenAppointments }: { rows: AppointmentRow[]; onOpenAppointments: () => void }) {
  const active = rows.filter((item) => item.status !== "CANCELLED");
  return (
    <>
      <section className="crm-metrics">
        <Metric label="Записи сьогодні" value="08" note="2 завершено · DEMO" />
        <Metric label="Найближчі" value={String(active.length + 21).padStart(2, "0")} note="демонстраційні записи" />
        <Metric label="Лікарі сьогодні" value="02" note="DEMO Dentist 01–02" />
        <Metric label="Calendar sync" value="—" note="не підключено · DEMO" warning />
      </section>
      <section className="crm-grid-main">
        <div className="crm-card">
          <CardTitle kicker="Demo source of truth" title="Найближчі записи" action="Усі записи" onAction={onOpenAppointments} />
          <AppointmentRows compact rows={rows} onOpen={onOpenAppointments} />
        </div>
        <div className="crm-card">
          <CardTitle kicker="Команда" title="Лікарі сьогодні" />
          <DoctorMini name="DEMO Dentist 01" meta="09:00–18:00 · 5 записів" value="01" />
          <DoctorMini name="DEMO Dentist 02" meta="10:00–17:00 · 3 записи" value="02" />
        </div>
      </section>
      <section className="crm-card crm-sync-card">
        <div>
          <span className="crm-status-icon"><RefreshCw /></span>
          <div><p className="crm-login-kicker">Google Calendar health</p><h2>Демо — Google Calendar не подключён</h2><p>У preview немає облікового запису, email, calendar ID або фальшивого SYNC OK.</p></div>
        </div>
        <button disabled>Налаштування недоступне в demo</button>
      </section>
    </>
  );
}

function Appointments({ rows, onOpen }: { rows: AppointmentRow[]; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("ALL");
  const filtered = useMemo(
    () => rows.filter((item) => {
      const matchesText = Object.values(item).join(" ").toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = status === "ALL" || item.status === status;
      return matchesText && matchesStatus;
    }),
    [filter, rows, status],
  );

  return (
    <section className="crm-card">
      <div className="crm-list-toolbar">
        <CardTitle kicker="Local demo state" title="Записи" />
        <label className="crm-search"><Search size={16} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Пацієнт, лікар, номер…" /></label>
        <select aria-label="Статус" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="ALL">Усі статуси</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="RESCHEDULED">RESCHEDULED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <AppointmentRows rows={filtered} onOpen={onOpen} />
    </section>
  );
}

function AppointmentRows({ compact = false, rows, onOpen }: { compact?: boolean; rows: AppointmentRow[]; onOpen: (id: string) => void }) {
  return (
    <div className="crm-appointments">
      {rows.slice(0, compact ? 3 : undefined).map((item) => (
        <article key={item.id}>
          <div className="crm-date"><strong>{formatTime(item.startsAt)}</strong><span>{formatDate(item.startsAt)}</span></div>
          <div className="crm-appointment-core"><strong>{item.patient}</strong><span>{item.service} · {item.doctor}</span><small>{item.id}</small></div>
          <div className="crm-tags"><span className={`crm-tag ${item.status.toLowerCase()}`}>{item.status}</span><span className="crm-tag sync">{item.sync}</span></div>
          <button aria-label={`Відкрити ${item.id}`} onClick={() => onOpen(item.id)}><ChevronRight /></button>
        </article>
      ))}
    </div>
  );
}

function Patients() {
  const patients = [
    { name: "DEMO Пацієнт 01", phone: "+380 •• ••• •• 21", visits: "4 демо-записи" },
    { name: "DEMO Пацієнт 02", phone: "+380 •• ••• •• 84", visits: "1 демо-запис" },
    { name: "DEMO Пацієнт 03", phone: "+380 •• ••• •• 07", visits: "2 демо-записи" },
  ];
  return <section className="crm-card"><CardTitle kicker="Контакти, не EMR" title="Демо-пацієнти" /><div className="crm-people-grid">{patients.map((item) => <Person key={item.name} {...item} />)}</div></section>;
}

function Doctors() {
  return (
    <section className="crm-card">
      <CardTitle kicker="Команда" title="Лікарі" />
      <div className="crm-resource-grid">
        <Resource title="DEMO Dentist 01" meta="Стоматолог-терапевт" lines={["DEMO Послуга 01, 02", "Пн–Пт · 09:00–18:00", "Calendar: NOT_CONNECTED"]} />
        <Resource title="DEMO Dentist 02" meta="Лікар-ортодонт" lines={["DEMO Послуга 01, 03", "Пн–Пт · 10:00–17:00", "Calendar: NOT_CONNECTED"]} />
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="crm-card">
      <CardTitle kicker="Availability engine" title="Демо-послуги" />
      <div className="crm-resource-grid">
        <Resource title="DEMO Послуга 01" meta="Професійна гігієна · 60 хв" lines={["Online demo: увімкнено", "Лікарів: 2", "Fixture: demo-hygiene"]} />
        <Resource title="DEMO Послуга 02" meta="Консультація терапевта · 45 хв" lines={["Online demo: увімкнено", "Лікарів: 1", "Fixture: demo-therapy"]} />
        <Resource title="DEMO Послуга 03" meta="Консультація ортодонта · 45 хв" lines={["Online demo: увімкнено", "Лікарів: 1", "Fixture: demo-ortho"]} />
      </div>
    </section>
  );
}

function Schedule() {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <div className="crm-two-col">
        <section className="crm-card">
          <CardTitle kicker="Working hours" title="Робочі години" action={editing ? "Готово" : "Змінити demo"} onAction={() => setEditing((value) => !value)} />
          <div className="crm-week">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day, index) => <span className={index > 4 ? "off" : ""} key={day}>{day}<strong>{index > 4 ? "Вихідний" : editing ? "09:15–17:45" : "09:00–18:00"}</strong></span>)}</div>
        </section>
        <section className="crm-card">
          <CardTitle kicker="Availability rules" title="Перерви" />
          <dl className="crm-settings-list"><div><dt>DEMO Dentist 01</dt><dd>13:00–13:30</dd></div><div><dt>DEMO Dentist 02</dt><dd>12:30–13:15</dd></div><div><dt>Тривалість слотів</dt><dd>15 хв</dd></div></dl>
        </section>
      </div>
      <section className="crm-card"><CardTitle kicker="Exceptions" title="Винятки розкладу" /><div className="crm-exceptions"><span><strong>28 серпня</strong>DEMO Dentist 01 · короткий день до 15:00</span><span><strong>31 серпня</strong>DEMO Dentist 02 · недоступний</span></div></section>
    </>
  );
}

function GoogleCalendar() {
  return (
    <>
      <section className="crm-google-hero"><div><p className="crm-login-kicker">Operational calendar · DEMO</p><h2>Демо — Google Calendar не подключён</h2><p>Немає реального Google account, email, calendar ID, OAuth token, service account або статусу SYNC OK.</p></div><button disabled>Підключення вимкнено</button></section>
      <section className="crm-two-col">
        <div className="crm-card"><CardTitle kicker="Visual mapping preview" title="Календарі лікарів" /><Mapping doctor="DEMO Dentist 01" /><Mapping doctor="DEMO Dentist 02" /></div>
        <div className="crm-card"><CardTitle kicker="Demo integration state" title="Стан інтеграції" /><dl className="crm-settings-list"><div><dt>Auth mode</dt><dd>Не обрано</dd></div><div><dt>Connected account</dt><dd>—</dd></div><div><dt>Calendar IDs</dt><dd>Не призначено</dd></div><div><dt>Watch channels</dt><dd>0</dd></div><div><dt>Sync jobs</dt><dd>0</dd></div></dl></div>
      </section>
    </>
  );
}

function Settings() {
  return (
    <section className="crm-card">
      <CardTitle kicker="Demo configuration" title="Налаштування клініки" />
      <dl className="crm-settings-list"><div><dt>Production booking</dt><dd>Вимкнено</dd></div><div><dt>Demo data adapter</dt><dd>Local / in-memory</dd></div><div><dt>Timezone</dt><dd>Europe/Kyiv</dd></div><div><dt>Ролі</dt><dd>Preview only · без auth</dd></div><div><dt>Patient data</dt><dd>Тільки DEMO fixtures</dd></div><div><dt>Google Calendar</dt><dd>Не підключено</dd></div></dl>
    </section>
  );
}

function CreateAppointmentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (item: AppointmentRow) => void }) {
  const [patient, setPatient] = useState("DEMO Пацієнт 04");
  const [service, setService] = useState("DEMO Послуга 01 · Професійна гігієна");
  const [doctor, setDoctor] = useState("DEMO Dentist 01");
  const [startsAt, setStartsAt] = useState("2026-08-28T10:00");

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate({ id: `DNTX-DEMO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, startsAt, patient, phone: "+380 •• ••• •• 00", service, doctor, status: "CONFIRMED", sync: "NOT_CONNECTED" });
  }

  return (
    <div className="crm-modal-layer" role="presentation">
      <button className="crm-modal-backdrop" aria-label="Закрити" onClick={onClose} />
      <section className="crm-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header><div><p className="crm-login-kicker">Local demo state</p><h2 id="create-title">Новий демо-запис</h2></div><button aria-label="Закрити" onClick={onClose}><X /></button></header>
        <form onSubmit={submit}>
          <label><span>Пацієнт</span><input required value={patient} onChange={(event) => setPatient(event.target.value)} /></label>
          <label><span>Послуга</span><select value={service} onChange={(event) => setService(event.target.value)}><option>DEMO Послуга 01 · Професійна гігієна</option><option>DEMO Послуга 02 · Консультація терапевта</option><option>DEMO Послуга 03 · Консультація ортодонта</option></select></label>
          <label><span>Лікар</span><select value={doctor} onChange={(event) => setDoctor(event.target.value)}><option>DEMO Dentist 01</option><option>DEMO Dentist 02</option></select></label>
          <label><span>Дата і час</span><input type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
          <p className="crm-modal-note"><CircleAlert size={15} /> Дані не надсилаються та зникнуть після оновлення сторінки.</p>
          <div className="crm-modal-actions"><button type="button" onClick={onClose}>Скасувати</button><button className="crm-primary">Створити demo</button></div>
        </form>
      </section>
    </div>
  );
}

function AppointmentDetailModal({ appointment, onClose, onReschedule, onCancel }: { appointment: AppointmentRow; onClose: () => void; onReschedule: (startsAt: string) => void; onCancel: () => void }) {
  const [startsAt, setStartsAt] = useState(appointment.startsAt);
  return (
    <div className="crm-modal-layer" role="presentation">
      <button className="crm-modal-backdrop" aria-label="Закрити" onClick={onClose} />
      <section className="crm-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header><div><p className="crm-login-kicker">{appointment.id}</p><h2 id="detail-title">Деталі демо-запису</h2></div><button aria-label="Закрити" onClick={onClose}><X /></button></header>
        <dl className="crm-modal-summary"><div><dt>Пацієнт</dt><dd>{appointment.patient}</dd></div><div><dt>Телефон</dt><dd>{appointment.phone}</dd></div><div><dt>Послуга</dt><dd>{appointment.service}</dd></div><div><dt>Лікар</dt><dd>{appointment.doctor}</dd></div><div><dt>Статус</dt><dd>{appointment.status}</dd></div><div><dt>Google</dt><dd>NOT_CONNECTED · DEMO</dd></div></dl>
        <label className="crm-modal-field"><span>Перенести дату / час</span><input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
        <p className="crm-modal-note"><CircleAlert size={15} /> Зміни існують лише в пам’яті цієї сторінки.</p>
        <div className="crm-modal-actions split"><button className="crm-danger" disabled={appointment.status === "CANCELLED"} onClick={onCancel}>Скасувати запис</button><button className="crm-primary" onClick={() => onReschedule(startsAt)}>Перенести</button></div>
      </section>
    </div>
  );
}

function Metric({ label, value, note, warning }: { label: string; value: string; note: string; warning?: boolean }) {
  return <article className={`crm-metric${warning ? " warning" : ""}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function CardTitle({ kicker, title, action, onAction }: { kicker: string; title: string; action?: string; onAction?: () => void }) {
  return <header className="crm-card-title"><div><p className="crm-login-kicker">{kicker}</p><h2>{title}</h2></div>{action ? <button onClick={onAction}>{action}</button> : null}</header>;
}

function DoctorMini({ name, meta, value }: { name: string; meta: string; value: string }) {
  return <div className="crm-doctor-mini"><Avatar value={value} /><div><strong>{name}</strong><span>{meta}</span></div><i className="online" /></div>;
}

function Avatar({ value }: { value: string }) { return <span className="crm-avatar">{value}</span>; }

function Person({ name, phone, visits }: { name: string; phone: string; visits: string }) {
  return <article className="crm-person"><Avatar value={name.slice(-2)} /><div><strong>{name}</strong><span>{phone}</span><small>{visits}</small></div><UsersRound size={17} /></article>;
}

function Resource({ title, meta, lines }: { title: string; meta: string; lines: string[] }) {
  const [expanded, setExpanded] = useState(false);
  return <article className={`crm-resource${expanded ? " expanded" : ""}`}><span className="crm-resource-mark" /><h3>{title}</h3><p>{meta}</p><ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>{expanded ? <p className="crm-resource-detail">Demo detail відкрито. Жодного запиту до backend не виконано.</p> : null}<button onClick={() => setExpanded((value) => !value)}>{expanded ? "Закрити" : "Відкрити"} <ChevronRight /></button></article>;
}

function Mapping({ doctor }: { doctor: string }) {
  return <div className="crm-mapping"><Avatar value={doctor.endsWith("01") ? "01" : "02"} /><div><strong>{doctor}</strong><span>Visual mapping preview · calendar ID відсутній</span></div><span className="crm-tag cancelled">NOT_CONNECTED</span></div>;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(new Date(value));
}
