import { siteHref } from "@/lib/site-href";

export function DemoSwitcher({ active }: { active: "patient" | "admin" }) {
  return (
    <nav className="demo-switcher" aria-label="Перемикач демонстраційних інтерфейсів">
      <span>DEMO</span>
      <a className={active === "patient" ? "active" : ""} href={siteHref("/")}>Сайт для пацієнта</a>
      <a className={active === "admin" ? "active" : ""} href={siteHref("/admin/")}>CRM адміністратора</a>
    </nav>
  );
}
