# DENTIX patient website

`optidigitalagent/dentix-booking-demo` is the selected working source for the new DENTIX patient website. GitHub Pages at https://optidigitalagent.github.io/dentix-booking-demo/ is a **noindex preview**. The future production target is https://dentix.ua/; PR-01 prepares a local artifact and does not launch or replace that site.

## Local development and builds

Use Node 22.18+ and `npm ci`.

| Command | Result |
| --- | --- |
| `npm run dev` | Development at http://127.0.0.1:4180/dentix-booking-demo/ |
| `npm run build` / `npm run build:preview` | `dist/preview`, base `/dentix-booking-demo/`, all pages `noindex,nofollow,noarchive` |
| `npm run build:production` | Local `dist/production`, base `/`, ten indexable patient routes |
| `npm run preview` | Serve preview locally on port 4181 |
| `npm run preview:production` | Serve production artifact locally on port 4182 |
| `npm test` | Unit and build-policy checks |
| `npm run test:artifacts` | Both built artifacts, initial HTML, links, heads, schema, admin isolation and HTTP 404 checks |
| `npm run test:browser` | Local five-viewport browser QA; set `PLAYWRIGHT_MODULE_PATH` to an installed Playwright `index.mjs` and `DENTIX_QA_OUTPUT` to an external evidence folder |

The build driver requires an explicit validated target. The default build and direct Vite invocation select preview unless `DENTIX_BUILD_TARGET` is explicitly set. The existing Pages workflow builds and uploads **only `dist/preview`**. Output directories are ignored; no CNAME or domain switch is generated.

All ten current patient routes are prerendered from the same React components and fallback data used for client hydration. Build-time rendering performs no content or booking requests. Asset references come from the client manifest. Public runtime content may refresh the fallback after hydration; malformed/unavailable content retains the existing section fallback. Updating the approved fallback requires a new build and review. Local `.env` files are not loaded by Vite; public runtime configuration is supplied explicitly as `VITE_DENTIX_*` process settings. Never put secrets in Vite variables.

Production head metadata uses Ukrainian route descriptions, self-canonicals and OG/Twitter. The sitemap contains exactly `/`, `/likari/`, `/kontakty/`, `/price.html`, `/terapevtychna-stomatolohiia/`, `/likuvannia-kariiesu/`, `/lechenie-pod-mikroskopom/`, `/khirurhichna-stomatolohiia/`, `/vydalennia-zuba/` and `/vydalennia-zuba-mudrosti/`, with no invented modification dates. Production-only entity JSON-LD uses approved clinic facts and visibly shown managed doctors. Therapy and surgery pages add a Service node matching the visible H1 and answer, plus breadcrumbs. Prices, offers, ratings, reviews, FAQ and inferred medical procedures are excluded from Schema. Existing visible fallback content is preserved; this technical change does not grant publication approval for pending clinical, team, price or legal facts.

## Admin, forms and hosting boundary

The `/admin/` entry and demo admin styles/code are built only in preview. Backend and operational admin responsibilities remain separate from this patient source. Never store real patient records, private account exports or credentials in this repository.

Forms retain their readiness and consent guards. Missing backend configuration/readiness keeps submission disabled; existing telephone links remain available. PR-01 QA does not submit forms or create appointments. The older browser scripts include broader integration scenarios; do not run submission scenarios without authorization.

Lead attribution comes from the validated build profile: preview uses `PUBLIC_DEMO`, production uses the existing `CANONICAL_CANDIDATE` label. Vite injects that value into both prerender and client builds; ContactSection and both BookingDrawer fallback forms pass it to the unchanged `source_site` payload contract. Each lead form exposes the same prop as `data-source-site` for non-submitting QA; it contains only the build source label and no personal data. No hostname inference is used.

Both targets include a standalone Ukrainian `404.html` with noindex, no canonical and no app/API dependency. The local artifact server returns HTTP 404 for missing URLs and production `/admin/`. GitHub Pages is expected to use `404.html` for unknown paths; a direct request to that existing file may return 200 there. Future production hosting must serve missing paths with status 404 and must not use an index.html SPA fallback. Verify actual hosting behavior during a separately authorized launch. Preview robots.txt does not block crawling of its noindex HTML or claim control of the shared GitHub Pages host root.

PR-01 does not perform deployment, DNS changes, sitemap submission, indexing requests or external account actions. Migration URL inventory, detailed entity approval and service pages require later authorization.

## PR-04A therapy pages

`src/data/therapy-pages.ts` holds the three Ukrainian service briefs, metadata, exact price-row selectors and doctor-role selection. `TherapyPage` reuses SiteLayout and the current design. Service pages and `/price.html` resolve values through the same managed content hook; fallback amounts and doctors stay in the original data files. A valid runtime snapshot with no matching rows/roles shows contact guidance rather than restoring removed fallback entries.

`tests/therapy-managed-browser.mjs` exercises valid, empty, invalid and unmatched content through real SSR/hydration and intercepted GET-only fixtures. It uses the same `PLAYWRIGHT_MODULE_PATH` and external `DENTIX_QA_OUTPUT` variables as the main browser suite. No fixture data ships.

The microscope/canals page preserves its existing URL; no separate canal route is created. Content is limited to approved services, current roles/prices and operational consultation/plan/contact wording. Named professional reviewer remains UNKNOWN; review for any new clinical explanations and production cutover remain gated. PR #5 merged PR-04A to the noindex preview; production remains unlaunched.

## PR-04B surgery cluster

Three additional Ukrainian routes reuse the service-page layout: `/khirurhichna-stomatolohiia/`, `/vydalennia-zuba/`, and `/vydalennia-zuba-mudrosti/`. Complex impacted extraction stays at `/vydalennia-zuba/#complex-extraction`. The explicit route contract now includes ten patient routes in both profiles; the local production sitemap lists exactly those ten URLs.

`src/data/surgery-pages.ts` owns bounded service/organizational copy, metadata and exact price-row names. `useManagedContent().priceBlocks` remains the sole price source; no implantation row or copied amounts are added. Approved fallback doctors contain no exact `хірург` role. Surgery pages therefore show contact guidance and zero doctor cards/Person nodes. A future managed exact surgeon role updates visible content and production Schema together. Invalid/empty sections preserve the existing global fallback; valid unmatched rows/roles never restore removed values.

`tests/surgery-pages.test.ts` and `tests/surgery-managed-browser.mjs` cover the source, price, role and Schema boundary. Run the latter with the same external Playwright and evidence variables as the browser suite. Professional review remains UNKNOWN / NOT_COMPLETED; expanded clinical copy and any named-surgeon production claim remain blocked pending approved evidence/review. This stage ends at a Draft PR; Ready, merge, deployment, production and PR-04C require separate authorization.
