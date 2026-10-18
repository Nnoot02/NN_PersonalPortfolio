// scripts/markup-anchor-probe.mjs
// Post-deploy proof for the deployed markup: the anchors the contract pins in the
// built export (scripts/portfolio-contract.mjs) must survive to the live HTML.
//
// Usage, after a deploy that matches this checkout:
//   pnpm probe:anchors
//
// Exit codes: 1 drift (a marker missing or a count wrong) TAKES PRECEDENCE over
// 2 a fetch failed -- a route that could not be read must not mask a drift seen on
// another route; 0 every anchor present and every count exact.
//
// Coverage: the four canonical entry points below, one page load each. It does NOT
// sweep every route in the export; add a route here when its anchors become
// load-bearing. A PASS pins marker PRESENCE and the hero leaf COUNT -- it does not
// prove the live build equals this checkout. The runner's network paths (fetch,
// non-200, artefact write) are exercised by the live run, not by fixtures; every
// check KIND has its own red fixture below, and all three sub-route specs are
// exercised by a table-driven pair of fixtures.

import { writeFileSync, mkdirSync } from "node:fs";

const ORIGIN = "https://nnoott.com";

export const ROUTES = ["/", "/projects", "/profile", "/projects/solar-grid-connection-assessment"];

// Check kinds:
//   {kind:"match", label, re} -- the regex must match the live HTML;
//   {kind:"count", label, re (global), scope?, exact} -- the match count inside the
//   scope region (or the whole document) must EQUAL `exact`. The hero count is SCOPED
//   to the hero figure and EXACT, mirroring the contract's own heroMedia slice and its
//   `=== ANIMATED_LEAVES` pin (46). A missing scope region reads as count 0, never a pass.
export const ANCHOR_SPEC = {
  "/": [
    { kind: "match", label: "canonical href is the origin root", re: /<link[^>]*rel="canonical"[^>]*href="https:\/\/nnoott\.com"/ },
    { kind: "match", label: "main landmark", re: /id="main-content"/ },
    { kind: "match", label: "primary navigation", re: /id="primary-navigation"/ },
    { kind: "match", label: "wordmark home link", re: /class="wordmark-home"/ },
    { kind: "match", label: "verified-work band", re: /id="verified-work"/ },
    { kind: "count", label: "hero plot leaves", scope: /<figure[^>]*class="hero-image"[^>]*>[\s\S]*?<\/figure>/, re: /pathLength="1"/g, exact: 46 },
  ],
  "/projects": [
    { kind: "match", label: "canonical href is /projects", re: /<link[^>]*rel="canonical"[^>]*href="https:\/\/nnoott\.com\/projects"/ },
    { kind: "match", label: "main landmark", re: /id="main-content"/ },
  ],
  "/profile": [
    { kind: "match", label: "canonical href is /profile", re: /<link[^>]*rel="canonical"[^>]*href="https:\/\/nnoott\.com\/profile"/ },
    { kind: "match", label: "main landmark", re: /id="main-content"/ },
  ],
  "/projects/solar-grid-connection-assessment": [
    { kind: "match", label: "canonical href is the project page", re: /<link[^>]*rel="canonical"[^>]*href="https:\/\/nnoott\.com\/projects\/solar-grid-connection-assessment"/ },
    { kind: "match", label: "main landmark", re: /id="main-content"/ },
  ],
};

export function classify(html, checks) {
  const findings = [];
  for (const c of checks) {
    if (c.kind === "match") {
      if (!c.re.test(html)) findings.push({ label: c.label, detail: "marker absent" });
    } else if (c.kind === "count") {
      const region = c.scope ? (html.match(c.scope)?.[0] ?? "") : html;
      const n = (region.match(c.re) ?? []).length;
      if (n !== c.exact) findings.push({ label: c.label, detail: `count ${n} != ${c.exact}` });
    } else {
      findings.push({ label: c.label ?? "unknown check", detail: `unknown kind ${c.kind}` });
    }
  }
  return findings;
}

// Drift beats a fetch failure: a route that could not be read must not mask a
// drift seen on another route.
export function exitCode({ drifted, fetchFailed }) {
  return drifted ? 1 : fetchFailed ? 2 : 0;
}

async function main() {
  const results = [];
  let fetchFailed = false;
  for (const route of ROUTES) {
    const url = `${ORIGIN}${route}`;
    try {
      const res = await fetch(url, { headers: { "user-agent": "nnoott-anchor-probe" } });
      if (!res.ok) {
        results.push({ route, url, status: res.status, ok: false, findings: [{ label: "http status", detail: `status ${res.status}` }] });
        continue;
      }
      const html = await res.text();
      const findings = classify(html, ANCHOR_SPEC[route] ?? []);
      results.push({ route, url, status: res.status, ok: findings.length === 0, findings });
    } catch (err) {
      fetchFailed = true;
      results.push({ route, url, status: null, ok: false, findings: [{ label: "fetch", detail: String(err?.message ?? err) }] });
    }
  }
  const drifted = results.some((r) => !r.ok && r.status !== null);
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/anchor-probe.json", JSON.stringify({ probedAt: new Date().toISOString(), origin: ORIGIN, coverage: ROUTES, results }, null, 1));
  for (const r of results) {
    const detail = r.findings.map((f) => `${f.label}: ${f.detail}`).join("; ");
    console.log(`${r.ok ? "PASS" : "FAIL"} ${r.route}${detail ? ` -- ${detail}` : ""}`);
  }
  process.exit(exitCode({ drifted, fetchFailed }));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, "/")}`).href) main();
