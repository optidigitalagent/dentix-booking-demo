import { site } from "@/data/site";
import { Reveal } from "./Reveal";

export function StatsRow() {
  return (
    <Reveal className="hero-stats" delay={200}>
      {site.stats.map((s, i) => (
        <div key={s.label} style={{ display: "contents" }}>
          {i > 0 ? <span className="stat-div" /> : null}
          <div className="stat">
            <span className="stat-num">{s.num}</span>
            <span className="stat-lbl">{s.label}</span>
          </div>
        </div>
      ))}
    </Reveal>
  );
}
