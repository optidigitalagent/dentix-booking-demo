# DENTIX PR05 local production candidate

These controls prepare Draft PR review. Hosting is `DECISION_PENDING_ACCESS`; React production is `NOT_LAUNCHED`. The archive does not deploy itself and contains no host adapter. Production cutover remains blocked by hosting access, HOLD preservation, qualified review, backups, configuration and measurement readiness.

Requires Node 22.18+, Python 3.9+ and existing npm lockfile. No dependencies added. Run from the repository root:

```sh
npm ci
npm test
npm run build:preview
node scripts/build-release.mjs
npm run test:artifacts
node --experimental-strip-types scripts/release-routes.mjs
python3 scripts/release.py verify
python3 scripts/release.py review
python3 -m unittest discover -s tests -p 'release_test.py' -v
```

The review generator and route generator update committed snapshots; inspect those diffs. To refresh migration observations, provide a separately captured public JSON array to `python3 scripts/release.py derive --observations /absolute/public-observations.json`. The canonical `.seo/redirect-map.csv` is unchanged. Its 3 KEEP, 4 REBUILD_SAME_URL, 7 planned 301, 1 proposed 410 and 49 HOLD dispositions are binding. `404_KEEP` explicitly preserves the already missing `/sitemap_index.xml` probe; it does not change a disposition. The oracle is host independent and leaves HOLD/functional-query cases unresolved.

Browser suites require an existing external Playwright installation and external evidence directory via `PLAYWRIGHT_MODULE_PATH` and `DENTIX_QA_OUTPUT`; no Playwright dependency is added here. Run existing `npm run test:browser`, the three managed-content suites and `node --experimental-strip-types tests/release-browser.mjs`. Network interception prevents submissions. The release smoke verifies all twelve routes at 390/1440, navigation, heads, errors, real 404 and exact interest seeds.

After the final source is committed, package outside the repository:

```sh
python3 scripts/release.py package --output "$HOME/Downloads/DENTIX_PRODUCTION_RELEASE_CANDIDATE_2026-09-13.zip"
```

Packaging refuses dirty tracked source, rebuilds production using the isolated candidate environment and records the final commit/tree, deterministic file hashes and ZIP checksums. Run twice to prove byte identity. ZIP entries use fixed timestamps; no archive hash is embedded in itself. The final external receipt and Draft PR body hold its SHA-256 and final Git identifiers, avoiding a self-referential commit. Extracted manifests and `artifact/` can be verified without GitHub or account access.

The candidate uses approved static content fallback and deliberately disabled intake. Preview workflow values are inventoried, unchanged. No runtime endpoint, tag, host rule, DNS record or external account was changed. See `RUNBOOK.md`, `checklists.json`, `hosting-decision.json`, `environment.json`, `access-t0.json` and the review packet for launch prerequisites.

Primary capability sources were checked on 2026-09-13 and are linked per candidate in `hosting-decision.json`. Cloudflare's `_redirects` cannot issue 410 or proxy an external legacy origin; a Worker/Functions layer requires design and owner access. GitHub Pages alone has no evidenced layer for this migration. Public nginx signals justify investigating current-host access, not assuming configuration rights.

Generated robots allow Googlebot, Bingbot and OAI-SearchBot through `User-agent: *; Allow: /`. This validates artifact policy, not real crawler reachability or discovery. OpenAI separates [search and training crawlers](https://developers.openai.com/api/docs/bots); no separate GPTBot restriction is generated and training preference remains an owner decision. [Google AI guidance](https://developers.google.com/search/docs/appearance/ai-features) does not require special AI markup. No llms.txt, ranking or citation claim is introduced.
