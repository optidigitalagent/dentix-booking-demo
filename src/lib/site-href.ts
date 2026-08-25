export function siteHref(path: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}` || "/";
}
