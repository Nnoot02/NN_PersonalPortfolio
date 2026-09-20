// Normalise every leaf stroke in the featured SLD for the CSS plot-in, tag the
// leaves that belong to a hover/click target, and write the schedule onto the
// root <svg>. Idempotent: previously managed attributes are stripped first, so
// a re-run is byte-identical.
//
// Run from the repo root:  node scripts/add-plot-attributes.mjs
import { readFileSync, writeFileSync } from "node:fs";

// leaf index (document order after </defs>) -> hover/click target. The indices
// are stable because this script owns the numbering; re-check with
// `node scripts/add-plot-attributes.mjs` output after any redraw.
const HITS = {
  supply: [1, 2],
  mains: [3, 4, 5, 6],
  device: [7],
  sup: [10, 14, 18, 24, 25, 26, 36, 37, 38],
  hai: [11, 15, 19, 27, 28, 29, 39, 40, 41],
  but: [12, 16, 20, 30, 31, 32, 42, 43, 44],
};
const hitOf = new Map();
for (const [target, idxs] of Object.entries(HITS)) for (const i of idxs) hitOf.set(i, target);

const path = "public/images/lv-cabling-sld.svg";
let s = readFileSync(path, "utf8");
if (/<(rect|line|circle|path|polyline|polygon)\b[^>]*><\/\1>/.test(s)) {
  throw new Error("non-self-closing leaf present; extend the rewriter");
}

// strip a previous run's managed output
s = s.replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s+style="--plot-[^"]*"/, "")}>`);
s = s.replace(/\s+pathLength="1"/g, "").replace(/\s+style="--plot-i:\d+"/g, "").replace(/\s+data-hit="[^"]*"/g, "");

const cut = s.indexOf("</defs>") + "</defs>".length;
const head = s.slice(0, cut);
let body = s.slice(cut);
let n = 0;
let skipped = 0;
body = body.replace(/<(line|path|circle|rect|polyline|polygon)\b([^>]*?)\/?>/g, (m, tag, attrs) => {
  if (tag === "rect" && /width="1200"/.test(attrs)) {
    skipped += 1;
    return m;
  }
  if (/\bstyle=/.test(attrs)) {
    // merge explicitly instead of writing a duplicate style attribute (a future
    // redraw that carries its own inline style would otherwise silently drop the
    // plot index)
    throw new Error(`leaf ${n + 1} carries its own style attribute; extend the rewriter to merge`);
  }
  n += 1;
  const hit = hitOf.has(n) ? ` data-hit="${hitOf.get(n)}"` : "";
  return `<${tag}${attrs.trimEnd()}${hit} pathLength="1" style="--plot-i:${n}" />`;
});
for (const [target, idxs] of Object.entries(HITS)) {
  const over = idxs.filter((i) => i > n);
  if (over.length) throw new Error(`HITS.${target} names leaves the drawing no longer has: ${over.join()}`);
}
// the voltage-drop target is a text label, not a leaf
body = body.replace(/<text\b([^>]*)>(ΔV[^<]*)<\/text>/g, (m, attrs, content) => `<text${attrs} data-hit="vd">${content}</text>`);

const step = Math.round((900 / n) * 100) / 100;
const end = Math.ceil(140 + n * step + 380);
const styled = head.replace(/<svg([^>]*)>/, (m, a) => `<svg${a} style="--plot-n:${n};--plot-step:${step}ms;--plot-end:${end}ms">`);
writeFileSync(path, styled + body);
console.log(JSON.stringify({ animated: n, skipped, step, end, targeted: hitOf.size + 1 }));
