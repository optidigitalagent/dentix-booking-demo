# DENTIX PR07 legacy migration candidate

These controls prepare a Draft PR and an isolated Mirohost staging candidate. React production remains `NOT_LAUNCHED`. The 64-row migration contract and 58 known query aliases are resolved; preservation bytes are in a separate private archive outside Git. No production rule is installed by packaging or testing. Existing current facts/services are owner-approved; new medical claims require separate qualified review.

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

The review generator and route generator update committed snapshots; inspect those diffs. `ops/release/migration-contract.json` is the final 64-row contract and `.seo/redirect-map.csv` is its canonical source map. `ops/release/hold-decisions.json` records evidence and the final decision for each of the 49 original HOLD rows. `ops/release/query-aliases.json` resolves known WordPress selectors. `404_KEEP` preserves the already missing `/sitemap_index.xml`. Do not regenerate the final contract from the old PR05 observations.

Browser suites require an existing external Playwright installation and external evidence directory via `PLAYWRIGHT_MODULE_PATH` and `DENTIX_QA_OUTPUT`; no Playwright dependency is added here. Run existing `npm run test:browser`, the three managed-content suites and `node --experimental-strip-types tests/release-browser.mjs`. Network interception prevents submissions. The release smoke verifies all twelve routes at 390/1440, navigation, heads, errors, real 404 and exact interest seeds.

After the final source is committed, package outside the repository:

```sh
python3 scripts/release.py package --output "$HOME/Downloads/DENTIX_PRODUCTION_RELEASE_CANDIDATE_PR07_REACT.zip"
```

Packaging refuses dirty tracked source, rebuilds production using the isolated candidate environment and records the final commit/tree, deterministic file hashes and ZIP checksums. Combine this React archive with the external preservation archive and rendered adapter in the PR07 production-GO candidate. The final external receipt and Draft PR body hold package SHA-256 and final Git identifiers. Staging must be replayed against the exact final bytes before a GO recommendation.

```sh
python3 ops/release/package_pr07_go.py \
  --release "$HOME/Downloads/DENTIX_PRODUCTION_RELEASE_CANDIDATE_PR07_REACT.zip" \
  --preservation "$HOME/Downloads/DENTIX_LEGACY_PRESERVATION_BUNDLE_2026-09-29.zip" \
  --output "$HOME/Downloads/DENTIX_PRODUCTION_GO_CANDIDATE_2026-09-29.zip"
```

The GO ZIP carries the exact public site files, both rendered production adapter variants, 64-row and alias contracts, rollback plan, credential-rotation checklist and phone-first launch mode. `production-sitemap-ready.htaccess` is only for a separately authorized cutover after the new sitemap is live. The private source backups, staging credentials and raw logs are absent.

The candidate uses approved static content fallback and deliberately disabled intake. Preview workflow values are inventoried, unchanged. No runtime endpoint, tag, host rule, DNS record or external account was changed. See `RUNBOOK.md`, `checklists.json`, `hosting-decision.json`, `environment.json`, `access-t0.json` and the review packet for launch prerequisites.

Primary capability sources were checked on 2026-09-13 and are linked per candidate in `hosting-decision.json`. Cloudflare's `_redirects` cannot issue 410 or proxy an external legacy origin; a Worker/Functions layer requires design and owner access. GitHub Pages alone has no evidenced layer for this migration. Public nginx signals justify investigating current-host access, not assuming configuration rights.

Generated robots allow Googlebot, Bingbot and OAI-SearchBot through `User-agent: *; Allow: /`. This validates artifact policy, not real crawler reachability or discovery. OpenAI separates [search and training crawlers](https://developers.openai.com/api/docs/bots); no separate GPTBot restriction is generated and training preference remains an owner decision. [Google AI guidance](https://developers.google.com/search/docs/appearance/ai-features) does not require special AI markup. No llms.txt, ranking or citation claim is introduced.
