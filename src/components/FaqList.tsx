import { useState } from "react";

export type FaqItem = { q: string; a: string };

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div className={`faq-item${open === i ? " open" : ""}`} key={item.q}>
          <button
            className="faq-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.q}</span>
            <span aria-hidden="true">{open === i ? "−" : "+"}</span>
          </button>
          <div className="faq-a" hidden={open !== i}>
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
