import { site } from "@/data/site";
import { siteHref } from "@/lib/site-href";

export function Brand({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <a
      href={siteHref("/")}
      className={`brand${variant === "footer" ? " brand-foot" : ""}`}
      aria-label={site.name}
    >
      <img className="brand-logo" src={site.logo} alt={`Логотип ${site.name}`} />
    </a>
  );
}
