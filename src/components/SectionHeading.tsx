import { Reveal } from "./Reveal";

export function SectionHeading({
  kicker,
  title,
  lede,
  center = true,
  ledeClassName = "",
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: string;
  center?: boolean;
  ledeClassName?: string;
}) {
  return (
    <Reveal className={`sec-head${center ? " center" : ""}`}>
      {kicker ? <span className="sec-kicker">{kicker}</span> : null}
      <h2 className="sec-title">{title}</h2>
      {lede ? <p className={`sec-lede ${ledeClassName}`.trim()}>{lede}</p> : null}
    </Reveal>
  );
}
