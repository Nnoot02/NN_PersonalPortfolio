// Post-deploy proof for Objective 2 (SCOPE.md): the three non-canonical entry
// points must answer 301/308 with Location: https://nnoott.com/..., the
// canonical URL must stay 200, and the worker that now runs ahead of the
// assets must not have cost the site its response headers.
//
// Usage, after a deploy that matches this checkout:
//   CI=true NEXT_PUBLIC_SITE_URL=https://nnoott.com pnpm build
//   pnpm exec wrangler deploy
//   pnpm probe:redirects

import { readFileSync } from "node:fs";

const CANONICAL_ORIGIN = "https://nnoott.com";
const CANONICAL_URL = `${CANONICAL_ORIGIN}/`;

// Both 301 and 308 are accepted on purpose: the in-repo worker answers 308,
// and the documented dashboard fallback (Cloudflare Single Redirect rule)
// answers 301. Either world passes this probe.
const REDIRECT_STATUSES = [301, 308];

const PROBES = [
  { label: "https apex (canonical)", url: CANONICAL_URL, kind: "canonical" },
  { label: "http apex", url: "http://nnoott.com/", kind: "redirect" },
  { label: "https www", url: "https://www.nnoott.com/", kind: "redirect" },
  { label: "http www", url: "http://www.nnoott.com/", kind: "redirect" },
  { label: "http www subpath", url: "http://www.nnoott.com/projects", kind: "redirect", location: `${CANONICAL_ORIGIN}/projects` },
];

const results = [];

function record(label, ok, detail) {
  results.push({ label, ok, detail });
}

async function probe(url) {
  return fetch(url, { redirect: "manual", headers: { "user-agent": "nnoott-canonical-probe" } });
}

function homeDocument() {
  try {
    return readFileSync(new URL("../out/index.html", import.meta.url), "utf8");
  } catch {
    console.error("Missing out/index.html - run a production build first (this probe reads out/ for one real asset URL).");
    process.exit(2);
  }
}

const home = homeDocument();

for (const { label, url, kind, location } of PROBES) {
  let response;
  try {
    response = await probe(url);
  } catch (error) {
    record(label, false, `request failed: ${error.message}`);
    continue;
  }

  if (kind === "canonical") {
    record(label, response.status === 200, `${response.status} (expected 200)`);
    record(
      `${label}: Strict-Transport-Security`,
      Boolean(response.headers.get("strict-transport-security")),
      response.headers.get("strict-transport-security") ?? "header absent (public/_headers not applied on this path)",
    );
    record(
      `${label}: X-Content-Type-Options`,
      response.headers.get("x-content-type-options") === "nosniff",
      response.headers.get("x-content-type-options") ?? "header absent",
    );
    continue;
  }

  const actual = response.headers.get("location") ?? "";
  const expected = location ?? CANONICAL_URL;
  const ok = REDIRECT_STATUSES.includes(response.status) && actual === expected;
  record(label, ok, `${response.status} Location: ${actual || "(none)"} (expected ${REDIRECT_STATUSES.join("|")} -> ${expected})`);
}

// A real hashed asset from the local build: proves the worker's asset
// passthrough still serves files, and still serves them with the immutable
// cache rule public/_headers declares.
const assetPath = home.match(/\/_next\/static\/[A-Za-z0-9._/-]+?\.(?:js|css|woff2)/)?.[0];
if (!assetPath) {
  record("asset probe", false, "no /_next/static asset URL found in out/index.html");
} else {
  try {
    const response = await probe(`${CANONICAL_ORIGIN}${assetPath}`);
    const cacheControl = response.headers.get("cache-control") ?? "";
    const ok = response.status === 200 && cacheControl.includes("immutable");
    record(
      `asset ${assetPath}`,
      ok,
      response.status === 404
        ? "404 - the local out/ is probably stale relative to the deployed build; rebuild, deploy, then re-probe"
        : `${response.status} Cache-Control: ${cacheControl || "(none)"}`,
    );
  } catch (error) {
    record(`asset ${assetPath}`, false, `request failed: ${error.message}`);
  }
}

const failures = results.filter((result) => !result.ok);
console.log("Canonical host/scheme probe\n");
for (const { label, ok, detail } of results) {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label.padEnd(38)} ${detail}`);
}
console.log(`\n${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length) {
  console.log("\nFailed checks mean the deploy under test does not yet collapse the entry points this objective names.");
  process.exit(1);
}
