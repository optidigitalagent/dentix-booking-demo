import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { getBuildProfile, patientRoute } from "../src/build-profile.ts";

test("validated build targets map to existing lead source labels", () => {
  assert.equal(getBuildProfile("preview").leadSource, "PUBLIC_DEMO");
  assert.equal(getBuildProfile("production").leadSource, "CANONICAL_CANDIDATE");
  for (const target of ["", "prod", "https://dentix.ua", "PUBLIC_DEMO"]) assert.throws(() => getBuildProfile(target));
});

test("native Vite config loads explicitly and direct/default invocation stays preview", async () => {
  const { loadConfigFromFile } = await import("vite");
  const previous = process.env.DENTIX_BUILD_TARGET;
  try {
    for (const target of [undefined, "preview", "production"]) {
      if (target === undefined) delete process.env.DENTIX_BUILD_TARGET;
      else process.env.DENTIX_BUILD_TARGET = target;
      const loaded = await loadConfigFromFile({ command: "build", mode: "production" }, undefined, undefined, undefined, undefined, "native");
      assert.ok(loaded);
      const production = target === "production";
      assert.equal(loaded.config.base, production ? "/" : "/dentix-booking-demo/");
      assert.equal(loaded.config.define?.__DENTIX_LEAD_SOURCE__, JSON.stringify(production ? "CANONICAL_CANDIDATE" : "PUBLIC_DEMO"));
    }
  } finally {
    if (previous === undefined) delete process.env.DENTIX_BUILD_TARGET;
    else process.env.DENTIX_BUILD_TARGET = previous;
  }
});

test("build targets are explicit, bounded and default npm build stays preview", () => {
  assert.equal(getBuildProfile("preview").base, "/dentix-booking-demo/");
  assert.equal(getBuildProfile("production").base, "/");
  for (const target of ["", "prod", "staging", "../production"]) assert.throws(() => getBuildProfile(target));
  for (const target of [[], ["unknown"]]) {
    const result = spawnSync(process.execPath, ["--experimental-strip-types", "scripts/build.mjs", ...target], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Usage:|Unknown DENTIX build target/);
  }
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts.build, "npm run build:preview");
  const workflow = fs.readFileSync(".github/workflows/deploy-pages.yml", "utf8");
  assert.match(workflow, /run: npm run build:preview\s/);
  assert.match(workflow, /path: dist\/preview\s/);
  assert.doesNotMatch(workflow, /build:production|dist\/production/);
});

test("patient route detection respects base and rejects admin and unknown URLs", () => {
  for (const base of ["/", "/dentix-booking-demo/"]) {
    assert.equal(patientRoute(base, base), "home");
    assert.equal(patientRoute(base + "index.html", base), "home");
    assert.equal(patientRoute(base + "price.html", base), "price");
    for (const route of ["admin/", "admin/index.html", "missing", "price.html/more"]) assert.equal(patientRoute(base + route, base), null);
  }
  assert.equal(patientRoute("/price.html", "/dentix-booking-demo/"), null);
});
