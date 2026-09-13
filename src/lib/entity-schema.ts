import { isSurgeryRoute, selectSurgeryDoctors, surgeryPages } from "../data/surgery-pages.ts";
import { isTherapyRoute, selectTherapyDoctors, therapyPages } from "../data/therapy-pages.ts";
import type { PatientRoute } from "../build-profile";
import { routeMetadata } from "../page-metadata.ts";
import type { Doctor } from "../data/doctors";
import type { site as siteData } from "../data/site";

type Clinic = typeof siteData;
const root = "https://dentix.ua/";
const sameSiteImage = (value: string) => {
  const url = new URL(value, root);
  return url.origin === new URL(root).origin && url.pathname.startsWith("/assets/") ? { image: url.href } : {};
};
const reference = (id: string) => ({ "@id": id });

// Values come from the same visible sources. Unsupported future formats fail
// closed instead of silently publishing different hours or an inferred address.
export function buildEntitySchema(route: PatientRoute, site: Clinic, doctors: Doctor[]) {
  const metadata = routeMetadata[route];
  const url = root + metadata.path;
  const clinicId = root + "#dentist";
  const servicePage = isSurgeryRoute(route) ? surgeryPages[route] : isTherapyRoute(route) ? therapyPages[route] : null;
  const serviceParent = isSurgeryRoute(route) && route !== "surgery" ? surgeryPages.surgery : isTherapyRoute(route) && route !== "therapy" ? therapyPages.therapy : null;
  const visibleDoctors = isSurgeryRoute(route) ? selectSurgeryDoctors(doctors) : isTherapyRoute(route) ? selectTherapyDoctors(route, doctors) : doctors;
  const teamVisible = route === "home" || route === "doctors" || Boolean(servicePage);
  const contactsVisible = route === "home" || route === "contacts";
  const city = /^(\d{5}), м\. (.+)$/.exec(site.city);
  const weekdays = /^Пн–Пт (\d{2}:\d{2})–(\d{2}:\d{2})$/.exec(site.schedule);
  const saturday = /^Сб (\d{2}:\d{2})–(\d{2}:\d{2}) · Нд зачинено$/.exec(site.scheduleNote);
  if (!city || !weekdays || !saturday) throw new Error("DENTIX entity source format requires review");
  const personId = (doctor: Doctor) => root + "#person-" + doctor.id;
  const founder = visibleDoctors.find((doctor) => doctor.id === "stanislav-stasiuk" && doctor.role === "Засновник клініки та головний лікар");
  const graph: Record<string, unknown>[] = [
    { "@type": "WebSite", "@id": root + "#website", url: root, name: site.name, inLanguage: "uk", publisher: reference(clinicId) },
    { "@type": route === "doctors" ? "CollectionPage" : route === "contacts" ? "ContactPage" : "WebPage", "@id": url + "#webpage", url, name: metadata.title, description: metadata.description, inLanguage: "uk", isPartOf: reference(root + "#website"), about: reference(clinicId), ...(servicePage ? { mainEntity: reference(url + "#service") } : {}), ...(route !== "home" ? { breadcrumb: reference(url + "#breadcrumbs") } : {}) },
    {
      "@type": "Dentist", "@id": clinicId, name: site.name, url: root,
      logo: new URL(site.logo, root).href,
      address: { "@type": "PostalAddress", streetAddress: site.address, postalCode: city[1], addressLocality: city[2], addressCountry: "UA" },
      telephone: [site.phonePrimary, site.phoneSecondary],
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: weekdays[1], closes: weekdays[2] },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: saturday[1], closes: saturday[2] },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "00:00", closes: "00:00" },
      ],
      ...(contactsVisible ? { email: site.email, sameAs: [site.instagramHref], hasMap: site.mapLink } : {}),
      ...(teamVisible ? { employee: visibleDoctors.map((doctor) => reference(personId(doctor))), ...(founder ? { founder: reference(personId(founder)) } : {}) } : {}),
    },
  ];
  if (teamVisible) for (const doctor of visibleDoctors) {
    graph.push({ "@type": "Person", "@id": personId(doctor), name: doctor.name, jobTitle: doctor.role, worksFor: reference(clinicId), ...sameSiteImage(doctor.photo) });
  }
  if (servicePage) graph.push({
    "@type": "Service", "@id": url + "#service", name: servicePage.h1, url,
    description: servicePage.answer, provider: reference(clinicId),
  });
  if (route !== "home") graph.push({
    "@type": "BreadcrumbList", "@id": url + "#breadcrumbs",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: root },
      ...(serviceParent ? [{ "@type": "ListItem", position: 2, name: serviceParent.label, item: root + serviceParent.path }] : []),
      { "@type": "ListItem", position: serviceParent ? 3 : 2, name: servicePage?.label ?? (route === "doctors" ? "Лікарі" : route === "contacts" ? "Контакти" : "Ціни"), item: url },
    ],
  });
  return { "@context": "https://schema.org", "@graph": graph };
}
