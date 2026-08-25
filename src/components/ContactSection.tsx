import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { BookingButton } from "./booking/BookingContext";

const contactSlots = [
  { label: "Телефон", value: site.phonePrimary },
  { label: "Адреса", value: `${site.address}, ${site.city}` },
  { label: "Графік", value: site.schedule },
  { label: "Соціальні мережі", value: site.instagram },
];

export function ContactSection() {
  return (
    <section className="section contact contact-stage" id="contact">
      <div className="wrap">
        <SectionHeading
          kicker="Запис"
          title="Заплануйте візит до DENTIX"
          lede="Структура запису вже готова. Підтверджені контакти та канал доставки форми будуть підключені окремо — без вигаданих даних і хибних повідомлень про успіх."
          center={false}
        />

        <div className="contact-composition">
          <Reveal as="aside" className="contact-rail">
            <span className="contact-rail-index" aria-hidden="true">
              01
            </span>
            <p className="contact-rail-kicker">Швидкий зв’язок</p>
            <h3>Усе потрібне для запису — в одному місці</h3>
            <p className="contact-rail-copy">
              Після підтвердження даних тут з’являться робочі номери, адреса, графік і посилання на
              соціальні мережі.
            </p>

            <div className="contact-slots" aria-label="Контактні дані готуються">
              {contactSlots.map((item) => (
                <div className="contact-slot" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="contact-data-state" role="status">
              <span className="contact-state-dot" aria-hidden="true" />
              Дані очікують підтвердження власника
            </div>
          </Reveal>

          <Reveal as="div" className="contact-panel" delay={90}>
            <div className="contact-panel-head">
              <div>
                <p className="contact-panel-kicker">Calm Booking Assistant</p>
                <h3>Записатися онлайн</h3>
              </div>
              <span className="contact-panel-status">6 коротких кроків</span>
            </div>
            <div className="contact-booking-launch">
              <p>Оберіть послугу, лікаря та реальний доступний час. Ім’я й телефон запитуються лише перед перевіркою запису.</p>
              <ul><li>Без медичних документів</li><li>Час перевіряється повторно на submit</li><li>Підтвердження тільки після відповіді API</li></ul>
              <BookingButton className="btn btn-block">Записатися онлайн</BookingButton>
              <p className="booking-note">У development preview використовуються лише явно позначені DEMO-дані.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
