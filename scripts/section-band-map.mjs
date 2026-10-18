// scripts/section-band-map.mjs
// Post-deploy structural proof: the ordered section bands of each covered route must
// survive to the live HTML, in order. Structure before pixels -- this catches a deploy
// that dropped, added, duplicated or moved a band, which no token or contract check sees.
//
// Usage, after a deploy that matches this checkout:
//   pnpm probe:bands
//
// Exit codes: 1 drift (missing, extra, duplicated or reordered bands) TAKES PRECEDENCE
// over 2 a source could not be read (live fetch failed, or the export file is absent);
// 0 identical. A PASS pins the band SEQUENCE and each band key's COUNT only -- it does
// not prove the live build equals this checkout. The runner's network paths are
// exercised by the live run, not by fixtures; every check KIND has its own red fixture.
//
// Coverage: the four canonical entry points; each route's expected bands are the ones
// the freshly built export carries (re-measured by the executor before landing).
//
// LIMIT: the section scan is regex-based and cannot resolve every HTML edge (a ">"
// inside a quoted attribute value truncates a tag; an unquoted value ending in "/" is
// not truly self-closing). React's static export emits neither shape -- Step 5 measures
// the export's own bands, and the fixtures cover the shapes it does emit. The fixtures
// do NOT pin the self-closing predicate against a quote-strip variant: reverting that
// predicate keeps them green, which is why the fix for it is this note, not a probe.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ORIGIN = "https://nnoott.com";

export const ROUTES = ["/", "/projects", "/profile", "/projects/solar-grid-connection-assessment"];

// Built-export path per route: "/" -> out/index.html, "/x" -> out/x.html,
// "/x/y" -> out/x/y.html (Next's static export layout).
export function exportPath(route) {
  return route === "/" ? "out/index.html" : `out${route}.html`;
}

// TOP-LEVEL sections only: a section nested inside another section is part of its
// parent's band, not a band of its own. The tag pattern requires a delimiter after
// "section" (so <section-header> is not a band) and a self-closing tag is a complete
// element that opens no depth.
export function extractBands(html) {
  const bands = [];
  const tag = /<(\/?)section(?=[\s/>])[^>]*>/g;
  let depth = 0;
  let m;
  while ((m = tag.exec(html))) {
    if (m[1] === "/") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    // A tag ending in "/>" is treated as self-closing. LIMIT (documented, not fixed): a
    // regex cannot resolve every HTML edge -- a ">" inside a quoted attribute value
    // truncates the tag, and an unquoted value ending in "/" (data-url=https://x/y/) is
    // not truly self-closing per the HTML spec. React's static export emits neither shape.
    const selfClosing = m[0].endsWith("/>");
    if (depth === 0) {
      const id = m[0].match(/id="([^"]+)"/)?.[1];
      const cls = m[0].match(/class="([^"]+)"/)?.[1]?.split(/\s+/)[0];
      bands.push(id ?? cls ?? "section");
    }
    if (!selfClosing) depth += 1;
  }
  return bands;
}

// Count-aware per key, and order compared over the keys whose multiplicity is EQUAL on
// both sides: a dropped or added duplicate reads as missing/extra (never as a reorder),
// and a straddling move of an equal-multiplicity key still reads as a reorder.
export function diffBands(expected, actual) {
  const count = (list) => list.reduce((acc, b) => acc.set(b, (acc.get(b) ?? 0) + 1), new Map());
  const ce = count(expected);
  const ca = count(actual);
  const missing = [];
  const extra = [];
  for (const [k, n] of ce) {
    const m = ca.get(k) ?? 0;
    if (m < n) missing.push(n - m === n ? k : `${k} x${n - m}`);
  }
  for (const [k, n] of ca) {
    const m = ce.get(k) ?? 0;
    if (m < n) extra.push(m === 0 ? k : `${k} x${n - m}`);
  }
  const common = (list) => list.filter((b) => ce.get(b) === ca.get(b)).join("|");
  const reordered = common(expected) !== common(actual);
  return { missing, extra, reordered };
}

// Drift beats a read failure: a source that could not be read must not mask a drift
// seen on another route.
export function exitCode({ drifted, sourceFailed }) {
  return drifted ? 1 : sourceFailed ? 2 : 0;
}

async function main() {
  const results = [];
  let sourceFailed = false;
  for (const route of ROUTES) {
    const url = `${ORIGIN}${route}`;
    let expected;
    try {
      expected = extractBands(readFileSync(exportPath(route), "utf8"));
    } catch (err) {
      sourceFailed = true;
      results.push({ route, url, ok: false, findings: [{ label: "export", detail: `cannot read ${exportPath(route)}: ${String(err?.message ?? err)}` }] });
      continue;
    }
    try {
      const res = await fetch(url, { headers: { "user-agent": "nnoott-band-map" } });
      if (!res.ok) {
        results.push({ route, url, ok: false, findings: [{ label: "http status", detail: `status ${res.status}` }] });
        continue;
      }
      const actual = extractBands(await res.text());
      const d = diffBands(expected, actual);
      const findings = [];
      if (d.missing.length) findings.push({ label: "missing bands", detail: d.missing.join(", ") });
      if (d.extra.length) findings.push({ label: "extra bands", detail: d.extra.join(", ") });
      if (d.reordered) findings.push({ label: "reordered bands", detail: `expected ${expected.join("|")}, live ${actual.join("|")}` });
      results.push({ route, url, expected, actual, ok: findings.length === 0, findings });
    } catch (err) {
      sourceFailed = true;
      results.push({ route, url, ok: false, findings: [{ label: "fetch", detail: String(err?.message ?? err) }] });
    }
  }
  const drifted = results.some((r) => !r.ok && !r.findings.some((f) => f.label === "fetch" || f.label === "export"));
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/band-map.json", JSON.stringify({ probedAt: new Date().toISOString(), origin: ORIGIN, coverage: ROUTES, results }, null, 1));
  for (const r of results) {
    const detail = r.findings.map((f) => `${f.label}: ${f.detail}`).join("; ");
    console.log(`${r.ok ? "PASS" : "FAIL"} ${r.route}${detail ? ` -- ${detail}` : ""}`);
  }
  process.exit(exitCode({ drifted, sourceFailed }));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, "/")}`).href) main();
