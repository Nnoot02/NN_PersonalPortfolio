// Regenerates public/images/og-card.png, the 1200x630 social share card.
//
// The card used to be rendered from a throwaway scratchpad file, so it could not
// be reproduced once that file was gone. This script is the card's source.
//
// Not wired into `pnpm verify`: verify must stay deterministic and must never
// rewrite a tracked binary. Run it by hand with `pnpm build:og` when the card
// changes, then eyeball the result before committing.
//
// The failure mode worth guarding is silent. A standalone page has no access to
// the Next-bundled fonts, so "Barlow Condensed" would quietly fall back to Arial
// Narrow and the card would regenerate wrong but entirely plausible. Neither
// document.fonts.ready nor document.fonts.load() catches that: ready fulfills
// after failed loads, and load() resolves successfully with an empty face list
// when nothing matches. So the fonts are read off disk, handed to explicitly
// constructed FontFace objects, and each one has to report status "loaded" or
// this script throws.

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const OUTPUT = fileURLToPath(new URL("../public/images/og-card.png", import.meta.url));

// Tokens copied from app/globals.css :root. If those change, change these.
const PAPER = "#f3f0e9";
const INK = "#242321";
const MUTED = "#6d6962";
const ACCENT = "#c84b1a";
const ACCENT_DARK = "#9f3510";

// Resolve through the package rather than hardcoding a path: hashed names under
// out/_next/static/media change every build, and .pnpm store paths carry the
// version. node_modules/@fontsource does exist here despite this install having
// no top-level symlinks for next/react/typescript.
function fontFile(pkg, file) {
  const pkgDir = dirname(require.resolve(`${pkg}/package.json`));
  return readFileSync(join(pkgDir, "files", file));
}

const FACES = [
  { family: "Barlow Condensed", weight: "600", bytes: fontFile("@fontsource/barlow-condensed", "barlow-condensed-latin-600-normal.woff2") },
  { family: "Barlow Condensed", weight: "700", bytes: fontFile("@fontsource/barlow-condensed", "barlow-condensed-latin-700-normal.woff2") },
  { family: "Inter", weight: "400", bytes: fontFile("@fontsource/inter", "inter-latin-400-normal.woff2") },
];

// Transformer over a busbar feeding three fused loads. Plain single-line diagram,
// same ink stroke as the site's SLD hero.
const singleLineDiagram = `
<svg width="302" height="354" viewBox="0 0 302 354" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="square">
  <circle cx="55.5" cy="32" r="29.5" />
  <circle cx="55.5" cy="62" r="29.5" />
  <path d="M55.5 93.5 V173" />
  <path d="M41 128 L70 115 M41 138 L70 125" stroke-width="3.5" />
  <path d="M0 176 H302" stroke-width="6" />
  <path d="M55.5 179 V201 M55.5 238 V278" />
  <rect x="46" y="202.5" width="19" height="34" stroke-width="3" />
  <rect x="16.5" y="280" width="78" height="46" />
  <path d="M37 328 V353 M55.5 328 V353 M74 328 V353" />
  <path d="M150.5 179 V201 M150.5 238 V278" />
  <rect x="141" y="202.5" width="19" height="34" stroke-width="3" />
  <rect x="111.5" y="280" width="78" height="46" />
  <path d="M132 328 V353 M150.5 328 V353 M169 328 V353" />
  <path d="M245.5 179 V201 M245.5 238 V278" />
  <rect x="236" y="202.5" width="19" height="34" stroke-width="3" />
  <rect x="206.5" y="280" width="78" height="46" />
  <path d="M227 328 V353 M245.5 328 V353 M264 328 V353" />
</svg>`;

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: ${PAPER}; overflow: hidden; }
  .card { display: flex; align-items: center; height: 100%; padding: 0 75px; gap: 40px; }
  .copy { flex: 1; }
  .eyebrow { color: ${ACCENT_DARK}; font: 600 24.7px/1.2 "Barlow Condensed"; letter-spacing: .155em; text-transform: uppercase; }
  .wordmark { font: 700 118px/1 "Barlow Condensed"; letter-spacing: 0; text-transform: uppercase; color: ${INK}; margin-top: 16px; }
  .wordmark span { color: ${ACCENT}; }
  .rule { width: 92px; height: 5px; background: ${ACCENT}; margin: 22px 0 25px; }
  .discipline { color: ${ACCENT_DARK}; font: 700 39px/1.103 "Barlow Condensed"; letter-spacing: .01em; text-transform: uppercase; }
  .claim { color: ${MUTED}; font: 400 21px/1.5 "Inter"; margin-top: 34px; }
  .domain { color: ${INK}; font: 700 23.5px/1.2 "Barlow Condensed"; letter-spacing: .139em; text-transform: uppercase; margin-top: 13px; }
  .diagram { flex: 0 0 302px; margin: -24px 15px 0 0; }
</style>
<div class="card">
  <div class="copy">
    <p class="eyebrow">Electrical engineering student &middot; Adelaide</p>
    <p class="wordmark">Nathan <span>No-ot</span></p>
    <div class="rule"></div>
    <p class="discipline">Power systems<br>and grid integration</p>
    <p class="claim">Standards-based power design, verified with calculations.</p>
    <p class="domain">nnoott.com</p>
  </div>
  <div class="diagram">${singleLineDiagram}</div>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });

const loaded = await page.evaluate(async (faces) => {
  const report = [];
  for (const face of faces) {
    const bytes = Uint8Array.from(atob(face.base64), (character) => character.charCodeAt(0));
    const fontFace = new FontFace(face.family, bytes.buffer, { weight: face.weight });
    try {
      await fontFace.load();
    } catch (error) {
      report.push({ ...face, base64: undefined, status: `load threw: ${error.message}` });
      continue;
    }
    document.fonts.add(fontFace);
    report.push({ family: face.family, weight: face.weight, status: fontFace.status });
  }
  return report;
}, FACES.map((face) => ({ family: face.family, weight: face.weight, base64: face.bytes.toString("base64") })));

const unloaded = loaded.filter((face) => face.status !== "loaded");
if (unloaded.length) {
  await browser.close();
  throw new Error(
    "refusing to write a card in fallback fonts; these faces did not load:\n  - " +
      unloaded.map((face) => `${face.family} ${face.weight}: ${face.status}`).join("\n  - "),
  );
}
for (const face of loaded) console.log(`font ok: ${face.family} ${face.weight}`);

await page.screenshot({ path: OUTPUT });
await browser.close();
console.log(`wrote ${OUTPUT}`);
