// Renders public/nathan-noot-resume.txt to public/nathan-noot-resume.pdf.
//
// The plain-text résumé is the single source of truth. The PDF is derived from
// it, so the two cannot disagree; before this script existed they did, and
// reconciling them was a blocker across two plan cycles.
//
// Run: pnpm build:resume. Deliberately NOT part of verify, which must never
// rewrite tracked binaries. Instead the generator records the source hash in
// scripts/resume-source.sha256 and the contract fails when the text has moved
// on without a regenerate.
//
// Typography follows DESIGN.md: Barlow Condensed for the name and section
// headings, Inter for body, --ink and --accent from the :root tokens. The page
// is white rather than --paper because the site's own @media print block drops
// the cream ground, and a résumé is printed far more often than it is skimmed.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const SOURCE = new URL("../public/nathan-noot-resume.txt", import.meta.url);
const PDF = new URL("../public/nathan-noot-resume.pdf", import.meta.url);
const HASH = new URL("./resume-source.sha256", import.meta.url);

// Sections whose body is prose, not entries and bullets.
const PROSE = new Set(["SUMMARY", "PUBLIC DISCLOSURE NOTE"]);

const FONTS = [
  ["Barlow Condensed", 600, "barlow-condensed/files/barlow-condensed-latin-600-normal.woff2"],
  ["Barlow Condensed", 700, "barlow-condensed/files/barlow-condensed-latin-700-normal.woff2"],
  ["Inter", 400, "inter/files/inter-latin-400-normal.woff2"],
  ["Inter", 600, "inter/files/inter-latin-600-normal.woff2"],
];

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A heading is a whole line of capitals: SUMMARY, TARGET ROLES, EXPERIENCE.
function isHeading(line) {
  return /^[A-Z][A-Z0-9 &'()/-]*$/.test(line) && line.trim().length > 2;
}

function parse(text) {
  const lines = text.split(/\r?\n/);
  const header = { name: lines[0].trim(), role: lines[1].trim(), contact: lines[2].trim() };
  const sections = [];
  let section = null;
  let bullet = null;
  let entry = null;

  const flush = () => {
    if (bullet) {
      section.blocks.push({ type: "bullet", text: bullet.join(" ") });
      bullet = null;
    }
    if (entry) {
      section.blocks.push({ type: "entry", lines: entry });
      entry = null;
    }
  };

  for (const raw of lines.slice(3)) {
    const line = raw.replace(/\s+$/, "");
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (isHeading(line.trim()) && !line.startsWith("- ") && !line.startsWith("  ")) {
      flush();
      section = { title: line.trim(), prose: PROSE.has(line.trim()), blocks: [] };
      sections.push(section);
      continue;
    }
    if (!section) continue;

    if (line.startsWith("- ")) {
      flush();
      bullet = [line.slice(2).trim()];
    } else if (line.startsWith("  ") && bullet) {
      bullet.push(line.trim());
    } else if (section.prose) {
      // Prose sections re-flow: the source is hard-wrapped at 80 columns and
      // the PDF column is a different width.
      const last = section.blocks[section.blocks.length - 1];
      if (last && last.type === "prose") last.text += ` ${line.trim()}`;
      else section.blocks.push({ type: "prose", text: line.trim() });
    } else {
      if (bullet) flush();
      entry = entry ? [...entry, line.trim()] : [line.trim()];
    }
  }
  flush();
  return { header, sections };
}

function render({ header, sections }, fontFaces) {
  const body = sections
    .map((section) => {
      const html = [];
      let list = [];
      const flushList = () => {
        if (list.length) {
          html.push(`<ul>${list.join("")}</ul>`);
          list = [];
        }
      };
      for (const block of section.blocks) {
        if (block.type === "bullet") {
          list.push(`<li>${escapeHtml(block.text)}</li>`);
          continue;
        }
        flushList();
        if (block.type === "prose") {
          html.push(`<p class="prose">${escapeHtml(block.text)}</p>`);
        } else {
          const [title, ...meta] = block.lines;
          html.push(`<div class="entry"><p class="entry-title">${escapeHtml(title)}</p>${meta
            .map((line) => `<p class="entry-meta">${escapeHtml(line)}</p>`)
            .join("")}</div>`);
        }
      }
      flushList();
      return `<section><h2>${escapeHtml(section.title)}</h2>${html.join("")}</section>`;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces}
:root { --ink: #242321; --muted: #56514a; --line: #d6d0c4; --accent: #c84b1a; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: var(--ink); }
/* 9.2pt/1.42 is the largest setting that still lands the résumé on two A4
   pages; 9.4/1.45 spills to three. Re-check the page count after editing the
   source text: scripts/build-resume-pdf.mjs prints it is not automatic. */
body { font: 400 9.2pt/1.42 "Inter", Arial, sans-serif; }
.masthead { border-bottom: 1.5px solid var(--ink); padding-bottom: 8pt; margin-bottom: 12pt; }
h1 { font: 700 30pt/0.92 "Barlow Condensed", "Arial Narrow", sans-serif; text-transform: uppercase; letter-spacing: -0.01em; margin: 0; }
.rule { background: var(--accent); height: 3px; width: 34px; margin: 6pt 0; }
.role { font: 600 11pt/1.2 "Barlow Condensed", "Arial Narrow", sans-serif; text-transform: uppercase; letter-spacing: 0.07em; color: var(--accent); margin: 0 0 4pt; }
.contact { font-size: 8.6pt; color: var(--muted); margin: 0; }
/* Sections are deliberately breakable: PROJECT EVIDENCE is taller than a page,
   so break-inside: avoid here cannot be honoured and merely forces an early
   page break, wasting most of a page. Entries and bullets are the right
   granularity, and break-after on the heading stops an orphaned title. */
section { margin: 0 0 8.5pt; }
h2 { break-after: avoid; }
h2 { font: 600 9.6pt/1.2 "Barlow Condensed", "Arial Narrow", sans-serif; text-transform: uppercase; letter-spacing: 0.13em; color: var(--ink); border-bottom: 1px solid var(--line); padding-bottom: 3pt; margin: 0 0 6pt; }
.prose { color: var(--muted); margin: 0 0 4pt; }
.entry { margin: 5.5pt 0 2.5pt; break-inside: avoid; }
.entry:first-of-type { margin-top: 0; }
.entry-title { font: 600 10.2pt/1.25 "Inter", Arial, sans-serif; margin: 0; }
.entry-meta { font-size: 8.8pt; color: var(--muted); margin: 0; }
ul { margin: 0 0 2pt; padding-left: 11pt; }
li { color: var(--muted); margin: 0 0 2.1pt; padding-left: 1pt; break-inside: avoid; }
li::marker { color: var(--accent); }
</style></head><body>
<header class="masthead">
  <h1>${escapeHtml(header.name)}</h1>
  <div class="rule"></div>
  <p class="role">${escapeHtml(header.role)}</p>
  <p class="contact">${escapeHtml(header.contact)}</p>
</header>
${body}
</body></html>`;
}

const text = await readFile(SOURCE, "utf8");
const fontFaces = (
  await Promise.all(
    FONTS.map(async ([family, weight, file]) => {
      const data = await readFile(new URL(`../node_modules/@fontsource/${file}`, import.meta.url));
      return `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: normal; font-display: block; src: url(data:font/woff2;base64,${data.toString("base64")}) format("woff2"); }`;
    }),
  )
).join("\n");

const html = render(parse(text), fontFaces);
// A PDF cannot be eyeballed from a terminal. RESUME_HTML_OUT=<abs path> dumps
// the exact markup the PDF is printed from, so layout can be checked in a
// browser or screenshotted at A4 before the binary is committed.
if (process.env.RESUME_HTML_OUT) await writeFile(process.env.RESUME_HTML_OUT, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", bottom: "14mm", left: "15mm", right: "15mm" },
});
await browser.close();

await writeFile(PDF, pdf);
// Hash LF-normalised content. .gitattributes is `* text=auto eol=lf`, so the
// working tree is CRLF on Windows after a tool writes it but LF after a fresh
// checkout. Hashing raw bytes would make this gate fail on a clean clone.
await writeFile(HASH, `${createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex")}\n`);
console.log(`resume pdf written: ${(pdf.length / 1024).toFixed(1)} KiB from ${text.length} bytes of source`);
