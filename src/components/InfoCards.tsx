import { site } from "@/data/site";
import { Reveal } from "./Reveal";

const icons = [
  <path key="a" d="M4 5h16v14H4z M8 9h8 M8 13h5" />,
  <path key="b" d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />,
  <path key="c" d="M12 20c-3 0-3-6-4-9-1-2-4-1-4-5 0-2 2-3 4-3h8c2 0 4 1 4 3 0 4-3 3-4 5-1 3-1 9-4 9z" />,
  <path key="d" d="M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z" />,
];

export function InfoCards() {
  return (
    <section className="trust">
      <div className="wrap trust-grid">
        {site.infoCards.map((card, i) => (
          <Reveal key={card.title} className="trust-item" delay={i * 70}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {icons[i % icons.length]}
            </svg>
            <div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
