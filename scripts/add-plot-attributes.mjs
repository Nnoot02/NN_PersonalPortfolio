// Normalise every leaf stroke in the featured SLD for the CSS plot-in and
// write the schedule onto the root <svg>. Idempotent: previously managed
// attributes are stripped first, so a re-run is byte-identical.
//
// Run from the repo root:  node scripts/add-plot-attributes.mjs
import { readFileSync, writeFileSync } from "node:fs";

const path = "public/images/lv-cabling-sld.svg";
let s = readFileSync(path, "utf8");
if (/<(rect|line|circle|path|polyline|polygon)\b[^>]*><\/\1>/.test(s)) {
  throw new Error("non-self-closing leaf present; extend the rewriter");
}

// strip a previous run's managed output
s = s.replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s+style="--plot-[^"]*"/, "")}>`);
s = s.replace(/\s+pathLength="1"/g, "").replace(/\s+style="--plot-i:\d+"/g, "");

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
  n += 1;
  return `<${tag}${attrs.trimEnd()} pathLength="1" style="--plot-i:${n}" />`;
});
const step = Math.round((900 / n) * 100) / 100;
const end = Math.ceil(140 + n * step + 380);
const styled = head.replace(/<svg([^>]*)>/, (m, a) => `<svg${a} style="--plot-n:${n};--plot-step:${step}ms;--plot-end:${end}ms">`);
writeFileSync(path, styled + body);
console.log(JSON.stringify({ animated: n, skipped, step, end }));
