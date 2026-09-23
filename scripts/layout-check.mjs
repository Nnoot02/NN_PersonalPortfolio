// Layout boundary check: serves `out/`, sweeps route/viewport boundaries,
// rejects horizontal overflow, verifies homepage epilogue geometry/focus/order,
// and saves screenshots under test-results/layout/.
//
// Run: pnpm build && pnpm test:layout
// Requires: pnpm add -D playwright && npx playwright install chromium

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const OUT_DIR = "out";
const SHOT_DIR = "test-results/layout";

// LAYOUT_FAST=1 narrows the sweep to the homepage at two viewports -- for local
// iteration and mutant runs. The default run is untouched: a green fast pass is
// not a green sweep, and the summary line says which one ran.
const FAST = process.env.LAYOUT_FAST === "1";

const ROUTES = FAST ? ["/"] : [
  "/",
  "/projects",
  "/about",
  "/contact",
  "/resume",
  "/workbench",
  "/profile",
  "/projects/solar-grid-connection-assessment",
  "/projects/lv-cabling-design-commercial-complex",
  "/projects/gps-denied-autonomous-uav",
  // Published route, in the sitemap, and it carries the longest title word on
  // the site ("Manufacturing"). It was outside this sweep, so the heading
  // word-break defect went unmeasured there; added 2026-09-04.
  "/projects/solar-manufacturing-dfma",
  "/workbench/bench-fume-extractor",
  // OAuth branding pages (2026-09-23): the Google Cloud project's Branding page
  // asks for a homepage URL and a privacy policy URL before the OAuth client can
  // be published. They are published routes like any other, so they are swept.
  "/internalos",
  "/privacy",
];

const VIEWPORTS = FAST ? [[390, 844], [1440, 900]] : [
  [320, 760],
  [375, 812],
  [390, 844],
  [480, 854],
  [640, 900],
  [720, 900],
  [721, 900],
  [759, 900],
  [760, 900],
  [768, 1024],
  [960, 900],
  [961, 900],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
];

const CONTACT_VIEWPORTS = [
  [390, 844],
  [720, 900],
  [721, 900],
  [768, 1024],
  [1024, 768],
  [1239, 900],
  [1240, 900],
  [1280, 900],
  [1440, 900],
];

const CONTACT_TEXT_VIEWPORTS = [
  [390, 844],
  [720, 900],
  [721, 900],
  [768, 1024],
  [1024, 768],
  [1240, 900],
  [1440, 900],
];

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".xml": "application/xml",
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") || "/";
  const candidates =
    clean === "/"
      ? [join(OUT_DIR, "index.html")]
      : [join(OUT_DIR, clean), join(OUT_DIR, `${clean}.html`), join(OUT_DIR, clean, "index.html")];
  return candidates.find((candidate) => existsSync(candidate) && extname(candidate) !== "");
}

async function main() {
  if (!existsSync(join(OUT_DIR, "index.html"))) {
    console.error(`No ${OUT_DIR}/index.html. Run \`pnpm build\` first.`);
    process.exit(1);
  }
  await mkdir(SHOT_DIR, { recursive: true });

  const server = createServer(async (req, res) => {
    const file = resolveFile(req.url ?? "/");
    if (!file) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch();
  const failures = [];
  const informational = [];
  let checks = 0;

  for (const [width, height] of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const route of ROUTES) {
      const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      checks += 1;
      if (!response || !response.ok()) {
        failures.push(`${route} @ ${width}x${height}: HTTP ${response ? response.status() : "no response"}`);
        continue;
      }
      // Label in name (WCAG 2.5.3, audit U6): the wordmark's accessible name
      // must start with the wordmark text on screen at this viewport.
      const wordmarkName = (await page.locator(".site-header .wordmark").ariaSnapshot()).match(/link "([^"]*)"/)?.[1] ?? "";
      const wordmarkVisible = await page.locator(".site-header .wordmark").evaluate((node) =>
        [...node.children].filter((el) => !el.classList.contains("sr-only") && getComputedStyle(el).display !== "none").map((el) => el.textContent).join("").trim());
      if (!wordmarkVisible || !wordmarkName.toLowerCase().startsWith(wordmarkVisible.toLowerCase())) {
        failures.push(`${route} @ ${width}x${height}: wordmark name "${wordmarkName}" must start with its visible text "${wordmarkVisible}"`);
      }
      // Case-study jump links: 24px targets that never overlap (audit U9).
      const jumpTargets = await page.locator(".case-opening-links .text-link").evaluateAll((nodes) => {
        const rects = nodes.map((node) => node.getBoundingClientRect());
        const overlaps = rects.some((a, i) => rects.some((b, j) => i < j && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom));
        return { count: rects.length, minHeight: Math.min(...rects.map((r) => r.height)), overlaps };
      });
      if (jumpTargets.count && (jumpTargets.minHeight < 24 || jumpTargets.overlaps)) {
        failures.push(`${route} @ ${width}x${height}: jump links must be >=24px targets with no overlap ${JSON.stringify(jumpTargets)}`);
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) {
        failures.push(`${route} @ ${width}x${height}: horizontal overflow ${overflow}px`);
      }
      // A heading must not be split inside a word. This is measured, not
      // estimated: a Range over each unbreakable run of characters returns more
      // than one client rect precisely when the browser has wrapped inside it.
      // Runs are split on hyphens too, so breaking "Grid-Connection" after the
      // hyphen stays legal. The overflow check above cannot catch this, because
      // splitting the word is exactly what keeps the document from overflowing.
      const brokenWords = await page.evaluate(() => {
        const broken = [];
        for (const heading of document.querySelectorAll("h1")) {
          const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          let node;
          while ((node = walker.nextNode())) {
            for (const match of node.textContent.matchAll(/[^\s-]{2,}/g)) {
              range.setStart(node, match.index);
              range.setEnd(node, match.index + match[0].length);
              if (range.getClientRects().length > 1) broken.push(match[0]);
            }
          }
        }
        return broken;
      });
      for (const word of brokenWords) {
        failures.push(`${route} @ ${width}x${height}: heading breaks inside the word "${word}"`);
      }
      if (route === "/") {
        const epilogue = page.locator("[data-homepage-epilogue]");
        const portals = page.locator("[data-homepage-portal]");
        if ((await epilogue.count()) !== 1) failures.push(`/ @ ${width}x${height}: homepage epilogue count is not 1`);
        if ((await portals.count()) !== 2) failures.push(`/ @ ${width}x${height}: homepage portal count is not 2`);

        const footerAdjacent = await page.evaluate(() => {
          // Since the F1 fix (site screening audit 2026-09-16) the footer sits
          // outside the main landmark: it must follow <main> directly, and the
          // epilogue must remain the last element inside <main>.
          const ribbon = document.querySelector("[data-homepage-epilogue]");
          const main = document.getElementById("main-content");
          if (!ribbon || !main) return false;
          return ribbon.nextElementSibling === null && (main.nextElementSibling?.matches(".site-footer") ?? false);
        });
        if (!footerAdjacent) failures.push(`/ @ ${width}x${height}: footer does not immediately follow epilogue`);

        // Site screening audit 2026-09-16, F4: the hero artifact must identify
        // itself and its action without hover (the sr-only span is gone).
        const heroArtifactCaption = await page.evaluate(() => {
          const caption = document.querySelector(".hero-artifact-caption");
          const action = document.querySelector(".hero-artifact-action");
          if (!caption || !action) return null;
          const style = getComputedStyle(caption);
          const box = caption.getBoundingClientRect();
          const actionBox = action.getBoundingClientRect();
          return {
            visible: style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0.9,
            width: Math.round(box.width),
            height: Math.round(box.height),
            actionHeight: Math.round(actionBox.height),
          };
        });
        if (!heroArtifactCaption) {
          failures.push(`/ @ ${width}x${height}: hero artifact caption missing`);
        } else if (!heroArtifactCaption.visible || heroArtifactCaption.height < 18 || heroArtifactCaption.width < 120 || heroArtifactCaption.actionHeight < 12) {
          failures.push(`/ @ ${width}x${height}: hero artifact caption is not visibly rendered (${JSON.stringify(heroArtifactCaption)})`);
        }

        const expectedImageSize = width < 760 ? 92 : 118;
        const imageBoxes = await page.locator(".homepage-portal-image").evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
          }),
        );
        for (const [index, box] of imageBoxes.entries()) {
          if (Math.abs(box.width - expectedImageSize) > 1 || Math.abs(box.height - expectedImageSize) > 1) {
            failures.push(`/ @ ${width}x${height}: portal ${index + 1} image is ${Math.round(box.width)}x${Math.round(box.height)}, expected ${expectedImageSize}px square`);
          }
        }
        // Portal photos ship at 2x their box, not full size (audit U7: the
        // originals were 1536/1200px wide for a 118px square).
        await page.locator(".homepage-epilogue").scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll(".homepage-portal-image img")].every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 5000 }).catch(() => {});
        const portalNatural = await page.locator(".homepage-portal-image img").evaluateAll((nodes) => nodes.map((img) => img.naturalWidth));
        // The solar row's box never exceeds ~574px, so at 1x it must take the
        // 800w srcset candidate, not the 1536px original.
        const solarRow = page.locator('[data-project-slug="solar-grid-connection-assessment"] .project-image img');
        await solarRow.scrollIntoViewIfNeeded();
        await solarRow.evaluate((img) => (img.complete && img.naturalWidth ? null : new Promise((ok) => { img.addEventListener("load", ok, { once: true }); setTimeout(ok, 5000); })));
        const solarSrc = await solarRow.evaluate((img) => img.currentSrc);
        if (!solarSrc.endsWith("/images/thumbs/solar-grid-connection-800.webp")) failures.push(`/ @ ${width}x${height}: solar row image at 1x must be the 800w candidate, got ${solarSrc}`);
        await page.evaluate(() => window.scrollTo(0, 0));
        for (const [index, natural] of portalNatural.entries()) {
          if (!natural || natural > 2 * 118 + 1) failures.push(`/ @ ${width}x${height}: portal ${index + 1} photo is ${natural}px wide, expected at most 2x the 118px box`);
        }

        if (width >= 760) {
          const epilogueHeight = await epilogue.evaluate((node) => node.getBoundingClientRect().height);
          if (epilogueHeight < 142 || epilogueHeight > 220) {
            failures.push(`/ @ ${width}x${height}: desktop epilogue height ${Math.round(epilogueHeight)}px is outside compact 142-220px range`);
          }
        }

        for (let index = 0; index < (await portals.count()); index += 1) {
          const portal = portals.nth(index);
          await portal.focus();
          const focus = await portal.evaluate((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), width: rect.width, height: rect.height };
          });
          if (focus.outlineStyle === "none" || focus.outlineWidth < 2) failures.push(`/ @ ${width}x${height}: portal ${index + 1} lacks non-colour focus outline`);
          if (focus.width < 44 || focus.height < 44) failures.push(`/ @ ${width}x${height}: portal ${index + 1} misses 44px touch target`);
        }

        // .hero-role is --accent, which measures 4.12:1 on paper: AA only at
        // large-text size (24px at weight 600). DESIGN.md forbids the accent
        // below that size, so pin the computed size at every viewport.
        const heroRoleSize = await page.locator(".hero-role").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
        if (heroRoleSize < 24) failures.push(`/ @ ${width}x${height}: .hero-role is ${heroRoleSize}px, below the 24px large-text floor its accent colour needs`);

        // Legend and detail text are functional: DESIGN.md's 12px floor, and
        // the value colour must clear 4.5:1 on the painted panel (--muted
        // measured 4.26:1 on --paper-deep, audit U1).
        const legendText = await page.evaluate(() => {
          const lum = (rgb) => {
            const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map((v) => {
              const c = Number(v) / 255;
              return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const painted = (node) => {
            for (let el = node; el; el = el.parentElement) {
              const bg = getComputedStyle(el).backgroundColor;
              if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
            }
            return getComputedStyle(document.body).backgroundColor;
          };
          const small = [...document.querySelectorAll(".hero-sld-row, .hero-sld-detail-title, .hero-sld-detail-body")]
            .map((node) => ({ cls: node.className, size: parseFloat(getComputedStyle(node).fontSize) }))
            .filter((entry) => entry.size < 12);
          const ratios = [...document.querySelectorAll(".hero-sld-row-value, .hero-artifact-caption-text")].map((node) => {
            const [a, b] = [lum(getComputedStyle(node).color), lum(painted(node))];
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
          return { small, count: ratios.length, minRatio: Math.min(...ratios) };
        });
        if (legendText.small.length) failures.push(`/ @ ${width}x${height}: hero legend/detail text below the 12px floor: ${JSON.stringify(legendText.small.slice(0, 3))}`);
        if (legendText.count !== 8 || legendText.minRatio < 4.5) failures.push(`/ @ ${width}x${height}: hero legend value contrast ${legendText.minRatio.toFixed(2)}:1 over ${legendText.count} values, needs 4.5:1 on all 7 values and the caption`);

        // Legend markers are line swatches, not boxes (audit U5): a hollow
        // square read as an unticked checkbox.
        const marker = await page.locator(".hero-sld-row-name").first().evaluate((node) => {
          const style = getComputedStyle(node, "::before");
          return { w: parseFloat(style.width), h: parseFloat(style.height), border: style.borderTopStyle };
        });
        if (!(marker.w >= 4 * marker.h) || marker.border !== "none") failures.push(`/ @ ${width}x${height}: legend marker must be a line swatch, got ${JSON.stringify(marker)}`);

        // A value that wraps hangs under its name, not under the swatch.
        const hanging = await page.evaluate(() => [...document.querySelectorAll(".hero-sld-row")].map((row) => {
          const name = row.querySelector(".hero-sld-row-name");
          const value = row.querySelector(".hero-sld-row-value").getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(name);
          const text = range.getClientRects()[0];
          return { target: row.dataset.target, wrapped: value.top > text.top + 2, drift: Math.round(value.left - text.left) };
        }).filter((row) => row.wrapped && Math.abs(row.drift) > 1));
        if (hanging.length) failures.push(`/ @ ${width}x${height}: wrapped legend values must hang under the name ${JSON.stringify(hanging)}`);

        // Hits are pointer-only (audit U4): the rows are the one keyboard path,
        // so the figure holds exactly 7 sequential stops, not 14.
        const heroStops = await page.evaluate(() => {
          const figure = document.querySelector(".hero-artifact-figure");
          const stops = [...figure.querySelectorAll("button, a[href], [tabindex]")].filter((el) => el.tabIndex >= 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest(".hero-sld-detail"));
          return { stops: stops.length, hitsHidden: figure.querySelector(".hero-sld-hits")?.getAttribute("aria-hidden") === "true" };
        });
        if (heroStops.stops !== 7 || !heroStops.hitsHidden) failures.push(`/ @ ${width}x${height}: hero figure must hold exactly the 7 row tab stops with the hits aria-hidden (${JSON.stringify(heroStops)})`);

        // Stacked hero (<=960, audit U2): the drawing takes the figure's full
        // width at 3:2; it measured 185x123 at 390 when the legend squeezed it.
        if (width <= 960) {
          const stacked = await page.evaluate(() => {
            const figure = document.querySelector(".hero-artifact-figure").getBoundingClientRect();
            const svg = document.querySelector(".hero-sld svg").getBoundingClientRect();
            return { figureW: figure.width, svgW: svg.width, svgH: svg.height };
          });
          if (stacked.svgW < stacked.figureW - 1 || Math.abs(stacked.svgH * 1.5 - stacked.svgW) > 2) failures.push(`/ @ ${width}x${height}: stacked hero drawing is ${Math.round(stacked.svgW)}x${Math.round(stacked.svgH)} in a ${Math.round(stacked.figureW)}px figure, expected full width at 3:2`);
        }

        // the figure is click-to-reveal now; the case-study link lives on the caption row
        const heroLink = page.locator("a.hero-artifact-caption");
        if ((await heroLink.count()) !== 1) failures.push(`/ @ ${width}x${height}: hero caption link count is not 1`);
        else {
          await heroLink.focus();
          const heroFocus = await heroLink.evaluate((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), width: rect.width, height: rect.height };
          });
          if (heroFocus.outlineStyle === "none" || heroFocus.outlineWidth < 2) failures.push(`/ @ ${width}x${height}: hero link lacks non-colour focus outline`);
          if (heroFocus.width < 44 || heroFocus.height < 44) failures.push(`/ @ ${width}x${height}: hero link misses 44px touch target`);

        // Hero entrance (design direction 2026-09-19): exact schedule, then the
        // static layout. Animations are selected PER TARGET so the SVG text
        // animations (also named hero-rise, added with the plot) cannot pollute
        // the numbers.
        const entrance = await page.evaluate(() => {
          const row = (el, name) => {
            const a = el.getAnimations().find((x) => x.animationName === name);
            const c = a?.effect.getComputedTiming();
            return { delay: c ? c.delay : null, end: c ? Number(c.endTime) : null };
          };
          return {
            rise: [...document.querySelectorAll(".hero-copy > *")].map((el) => row(el, "hero-rise")),
            mask: [...document.querySelectorAll(".hero-name > span")].map((el) => row(el, "hero-mask")),
          };
        });
        const RISE_DELAYS = [60, 120, 180, 240, 300, 360, 420];
        const riseDelays = entrance.rise.map((r) => r.delay);
        if (riseDelays.length !== 7 || RISE_DELAYS.some((d, i) => riseDelays[i] !== d)) {
          failures.push(`/ @ ${width}x${height}: hero rise delays must be exactly ${RISE_DELAYS.join()} (got ${riseDelays.join()})`);
        }
        const maskDelays = entrance.mask.map((r) => r.delay);
        if (maskDelays.length !== 2 || maskDelays.join() !== "0,90") {
          failures.push(`/ @ ${width}x${height}: hero mask delays must be 0,90 (got ${maskDelays.join()})`);
        }
        // endTime carries float noise (919.9999999999999 for 920), so the
        // schedule is asserted with a 1 ms tolerance.
        const entranceEnd = Math.max(...[...entrance.rise, ...entrance.mask].map((r) => r.end ?? 0));
        if (Math.abs(entranceEnd - 920) > 1) failures.push(`/ @ ${width}x${height}: hero entrance must end at 920 ms (got ${entranceEnd})`);
        // Scope the wait to the entrance's own animations: the plot and the
        // callout pings legitimately outlive the entry, and 8 s absorbs the
        // headless first-paint lag that delays the animation clock.
        await page.waitForFunction(() => [...document.querySelectorAll(".hero-copy > *, .hero-name > span")]
          .every((el) => el.getAnimations().every((a) => a.playState === "finished" || a.playState === "idle")), null, { timeout: 8000 });
        // A finished animation with `fill: both` reports the identity matrix,
        // not the string "none", so "settled" accepts both.
        const settled = await page.evaluate(() => {
          const isStatic = (t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
          return {
            summaryOpacity: getComputedStyle(document.querySelector(".hero-summary")).opacity,
            shifted: [...document.querySelectorAll(".hero-copy > *")].some((c) => !isStatic(getComputedStyle(c).transform)),
            spans: [...document.querySelectorAll(".hero-name > span")].map((s) => ({ transform: getComputedStyle(s).transform, clip: getComputedStyle(s).clipPath })),
          };
        });
        const settledStatic = (t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
        if (settled.summaryOpacity !== "1" || settled.shifted) {
          failures.push(`/ @ ${width}x${height}: hero entrance must settle to the static layout (${JSON.stringify(settled)})`);
        }
        if (settled.spans.some((s) => !settledStatic(s.transform) || !s.clip.includes("-12%"))) {
          failures.push(`/ @ ${width}x${height}: hero name spans must settle fully revealed (${JSON.stringify(settled.spans)})`);
        }

        // Hero plot (design direction 2026-09-19): the index set first, then
        // delays derived from that set, then the window the root declares, then
        // the drawn end state and the dash pattern the draw-in depends on.
        const PLOT_N = 46, PLOT_WINDOW = 900, PLOT_OFFSET = 140, PLOT_DRAW = 380;
        const EXPECTED_STEP = Math.round((PLOT_WINDOW / PLOT_N) * 100) / 100; // 19.15
        const EXPECTED_END = Math.ceil(PLOT_OFFSET + PLOT_N * EXPECTED_STEP + PLOT_DRAW); // 1421
        const plot = await page.evaluate(() => {
          const root = document.querySelector(".hero-sld svg");
          const stepMs = parseFloat(getComputedStyle(root).getPropertyValue("--plot-step"));
          const endMs = parseFloat(getComputedStyle(root).getPropertyValue("--plot-end"));
          const strokes = [...root.querySelectorAll("[pathLength]")].map((el) => {
            const i = Number(getComputedStyle(el).getPropertyValue("--plot-i"));
            const a = el.getAnimations().find((x) => x.animationName === "plot");
            const c = a?.effect.getComputedTiming();
            return { i, delay: c ? c.delay : null, end: c ? Number(c.endTime) : null };
          });
          return { stepMs, endMs, strokes };
        });
        const indices = plot.strokes.map((s) => s.i).sort((a, b) => a - b);
        const expectedIdx = Array.from({ length: PLOT_N }, (_, k) => k + 1);
        if (JSON.stringify(indices) !== JSON.stringify(expectedIdx)) {
          failures.push(`/ @ ${width}x${height}: plot indices must be exactly 1..${PLOT_N} (got ${indices.length} values)`);
        }
        if (Math.abs(plot.stepMs - EXPECTED_STEP) > 1 || Math.abs(plot.endMs - EXPECTED_END) > 1) {
          failures.push(`/ @ ${width}x${height}: plot schedule must equal the locked window (step ${EXPECTED_STEP}, end ${EXPECTED_END}): ${JSON.stringify({ step: plot.stepMs, end: plot.endMs })}`);
        }
        const drifted = plot.strokes.filter((s) => s.delay === null || Math.abs(s.delay - (PLOT_OFFSET + (s.i - 1) * EXPECTED_STEP)) > 1);
        if (drifted.length) failures.push(`/ @ ${width}x${height}: plot schedule drifted: ${JSON.stringify(drifted.slice(0, 3))}`);
        if (Math.max(...plot.strokes.map((s) => s.end ?? 0)) > plot.endMs) {
          failures.push(`/ @ ${width}x${height}: plot must finish before --plot-end`);
        }
        await page.waitForFunction(() => [...document.querySelectorAll(".hero-sld svg [pathLength]")]
          .every((el) => el.getAnimations().every((a) => a.playState === "finished" || a.playState === "idle")), null, { timeout: 8000 });
        const drawn = await page.evaluate(() => {
          const strokes = [...document.querySelectorAll(".hero-sld svg [pathLength]")];
          return { count: strokes.length, offsets: [...new Set(strokes.map((s) => getComputedStyle(s).strokeDashoffset))] };
        });
        if (drawn.count !== PLOT_N || drawn.offsets.join() !== "0px") {
          failures.push(`/ @ ${width}x${height}: plot must finish fully drawn, got ${JSON.stringify(drawn)}`);
        }
        const dashes = await page.evaluate(() => [...new Set([...document.querySelectorAll(".hero-sld svg [pathLength]")].map((s) => getComputedStyle(s).strokeDasharray))]);
        if (dashes.length !== 1 || dashes[0] !== "1px") {
          failures.push(`/ @ ${width}x${height}: every plotted stroke must carry the dash pattern the draw-in depends on (got ${JSON.stringify(dashes)})`);
        }
        // Paused mid-flight oracle on its own page so the frozen state cannot
        // leak. The frozen 700 ms frame must show finished, in-flight and
        // waiting strokes: a from-offset near 0 would show none waiting.
        const midPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await midPage.goto(`${base}/`, { waitUntil: "load" });
        const mid = await midPage.evaluate(() => {
          document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 700; });
          const offsets = [...document.querySelectorAll(".hero-sld svg [pathLength]")].map((s) => parseFloat(getComputedStyle(s).strokeDashoffset));
          const hiddenCopy = [...document.querySelectorAll(".hero-copy > *")].filter((c) => parseFloat(getComputedStyle(c).opacity) < 1).length;
          return {
            finished: offsets.filter((o) => o <= 0.02).length,
            active: offsets.filter((o) => o > 0.02 && o < 0.98).length,
            waiting: offsets.filter((o) => o >= 0.98).length,
            hiddenCopy,
          };
        });
        await midPage.close();
        if (mid.finished < 1 || mid.active < 1 || mid.waiting < 1) {
          failures.push(`/ @ ${width}x${height}: the frozen 700 ms frame must show finished, in-flight and waiting strokes: ${JSON.stringify(mid)}`);
        }
        if (mid.hiddenCopy < 1) failures.push(`/ @ ${width}x${height}: frozen mid-flight frame must show pre-entrance copy, got ${JSON.stringify(mid)}`);

        // Hover/click reveal (re-cut 2026-09-20, R1 fold): hovering a component
        // paints its linework; clicking opens its detail in the panel. Measure
        // only after the row pings settle (a mid-ping frame carries 0.86 scale).
        await page.waitForFunction(() => [...document.querySelectorAll(".hero-sld-row, .hero-sld-hit")]
          .every((el) => el.getAnimations().every((a) => a.playState === "finished" || a.playState === "idle")), null, { timeout: 8000 });
        const TARGET_IDS = ["supply", "mains", "vd", "device", "sup", "hai", "but"];
        const revealGeo = await page.evaluate((ids) => {
          const stage = document.querySelector(".hero-sld-stage").getBoundingClientRect();
          const figure = document.querySelector(".hero-artifact-figure").getBoundingClientRect();
          const panel = document.querySelector(".hero-sld-panel").getBoundingClientRect();
          const root = document.querySelector(".hero-sld svg");
          const endMs = parseFloat(getComputedStyle(root).getPropertyValue("--plot-end"));
          const boxOf = (nodes) => {
            const xs = [];
            const ys = [];
            for (const node of nodes) {
              const b = node.getBBox();
              const m = node.getScreenCTM();
              for (const [x, y] of [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
                const p = new DOMPoint(x, y).matrixTransform(m);
                xs.push(p.x);
                ys.push(p.y);
              }
            }
            return xs.length ? { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) } : null;
          };
          const rows = [...document.querySelectorAll(".hero-sld-row")].map((el, i) => {
            const r = el.getBoundingClientRect();
            const a = el.getAnimations().find((x) => x.animationName === "callout-ping");
            return { target: el.getAttribute("data-target"), w: Math.round(r.width), h: Math.round(r.height), inside: r.left >= figure.left - 1 && r.right <= figure.right + 1 && r.top >= figure.top - 1 && r.bottom <= figure.bottom + 1, delay: a?.effect.getComputedTiming().delay ?? null, expected: endMs + i * 260, box: { l: r.left, r: r.right, t: r.top, b: r.bottom } };
          });
          const hits = [...document.querySelectorAll(".hero-sld-hit")].map((el) => {
            const r = el.getBoundingClientRect();
            const id = el.getAttribute("data-target");
            const own = boxOf([...document.querySelectorAll(`.hero-sld svg [data-hit="${id}"]`)]);
            const others = ids.filter((x) => x !== id).map((x) => boxOf([...document.querySelectorAll(`.hero-sld svg [data-hit="${x}"]`)]));
            return {
              target: id,
              w: Math.round(r.width),
              h: Math.round(r.height),
              inside: r.left >= stage.left - 1 && r.right <= stage.right + 1 && r.top >= stage.top - 1 && r.bottom <= stage.bottom + 1,
              interactive: getComputedStyle(el).pointerEvents !== "none",
              box: { l: r.left, r: r.right, t: r.top, b: r.bottom },
              own,
              others,
            };
          });
          const columns = getComputedStyle(document.querySelector(".hero-sld-rows")).gridTemplateColumns.split(" ").length;
        // the interaction boundary must be one threshold, no gap: read it back
        // from the shipped CSSOM rather than trusting the source text
        const cqText = [...document.styleSheets].flatMap((sheet) => {
          try {
            return [...sheet.cssRules].map((rule) => rule.cssText);
          } catch {
            return [];
          }
        }).filter((text) => text.includes("@container") && text.includes("figure")).join("\n");
          const figStyle = getComputedStyle(document.querySelector(".hero-artifact-figure"));
          const figureContentW = document.querySelector(".hero-artifact-figure").clientWidth
            - parseFloat(figStyle.paddingLeft) - parseFloat(figStyle.paddingRight);
          return {
            rows,
            hits,
            columns,
            cqText,
            figureContentW,
            figure: { t: figure.top, b: figure.bottom },
            panel: { t: panel.top, b: panel.bottom, h: Math.round(panel.height) },
            stageW: Math.round(stage.width),
            panelW: Math.round(panel.width),
          };
        }, TARGET_IDS);
        const inter = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
        if (revealGeo.rows.length !== 7 || revealGeo.rows.map((r) => r.target).join() !== TARGET_IDS.join()) {
          failures.push(`/ @ ${width}x${height}: seven reveal rows in order expected (got ${revealGeo.rows.map((r) => r.target).join()})`);
        }
        if (revealGeo.rows.some((r) => !r.inside || r.w === 0 || r.h === 0)) {
          failures.push(`/ @ ${width}x${height}: reveal rows must sit inside the figure (${JSON.stringify(revealGeo.rows.map((r) => [r.w, r.h, r.inside]))})`);
        }
        // the rows are the pointer path below 561, so they carry the 24px floor everywhere
        if (revealGeo.rows.some((r) => r.h < 24 || r.w < 24)) {
          failures.push(`/ @ ${width}x${height}: reveal rows must be at least 24px (${JSON.stringify(revealGeo.rows.map((r) => [r.w, r.h]))})`);
        }
        if (revealGeo.rows.some((r) => r.delay === null || Math.abs(r.delay - r.expected) > 1)) {
          failures.push(`/ @ ${width}x${height}: reveal rows must ping after the plot (${JSON.stringify(revealGeo.rows.map((r) => r.delay))})`);
        }
        const cqPositive = (revealGeo.cqText.match(/\(min-width: 560\.5px\)/g) ?? []).length;
        const cqNegated = (revealGeo.cqText.match(/not \(min-width: 560\.5px\)/g) ?? []).length;
        if (cqPositive < 2 || cqNegated < 1 || /560px|561px/.test(revealGeo.cqText)) {
          failures.push(`/ @ ${width}x${height}: the interaction boundary must be one threshold with no gap (positive ${cqPositive}, negated ${cqNegated})`);
        }
        if (revealGeo.columns !== (revealGeo.figureContentW >= 560.5 ? 2 : 1)) {
          failures.push(`/ @ ${width}x${height}: reveal rows must use ${revealGeo.figureContentW >= 560.5 ? 2 : 1} column(s) at a ${Math.round(revealGeo.figureContentW)}px figure (got ${revealGeo.columns})`);
        }
        for (let a = 0; a < revealGeo.rows.length; a += 1) {
          for (let b = a + 1; b < revealGeo.rows.length; b += 1) {
            const A = revealGeo.rows[a].box, B = revealGeo.rows[b].box;
            if (A.l < B.r && B.l < A.r && A.t < B.b && B.t < A.b) failures.push(`/ @ ${width}x${height}: reveal rows ${a} and ${b} overlap`);
          }
        }
        if (revealGeo.hits.length !== 7 || revealGeo.hits.some((h) => !h.inside)) {
          failures.push(`/ @ ${width}x${height}: seven hit areas inside the stage expected (${JSON.stringify(revealGeo.hits.map((h) => [h.target, h.w, h.h, h.inside, h.interactive]))})`);
        }
        // below 561 the drawing is 300x200: a 24px floor would make neighbouring
        // targets overlap, so the hits go inert and the labelled rows take over
        // the container query resolves against the figure's content box
        const hitsInteractive = revealGeo.figureContentW >= 560.5;
        if (revealGeo.hits.some((h) => h.interactive !== hitsInteractive)) {
          failures.push(`/ @ ${width}x${height}: hits must be ${hitsInteractive ? "interactive" : "inert"} at a ${Math.round(revealGeo.figureContentW)}px figure (${JSON.stringify(revealGeo.hits.map((h) => [h.target, h.interactive]))})`);
        }
        if (!hitsInteractive) {
          const narrowHits = await page.evaluate(() => [...document.querySelectorAll(".hero-sld-hit")].map((el) => getComputedStyle(el).visibility));
          if (narrowHits.some((v) => v !== "hidden")) {
            failures.push(`/ @ ${width}x${height}: below the 560.5px boundary the hits must be invisible too (tab order), got ${JSON.stringify(narrowHits)}`);
          }
        }
        if (hitsInteractive) {
          if (revealGeo.hits.some((h) => h.w < 24 || h.h < 24)) {
            failures.push(`/ @ ${width}x${height}: interactive hit areas must be at least 24px (${JSON.stringify(revealGeo.hits.map((h) => [h.target, h.w, h.h]))})`);
          }
          for (let a = 0; a < revealGeo.hits.length; a += 1) {
            for (let b = a + 1; b < revealGeo.hits.length; b += 1) {
              const A = revealGeo.hits[a].box, B = revealGeo.hits[b].box;
              if (inter(A, B) > 0) failures.push(`/ @ ${width}x${height}: hit areas ${revealGeo.hits[a].target} and ${revealGeo.hits[b].target} overlap (${Math.round(inter(A, B))}px2)`);
            }
          }
          // a hit rect must name the component it sits on: its centre must lie in
          // its own leaves' box (or within 6px) and be no further from its own
          // box than from any other target's. A swapped rect pair fails both.
          const centreDist = (box, h) => {
            const cx = (h.box.l + h.box.r) / 2;
            const cy = (h.box.t + h.box.b) / 2;
            return Math.hypot(Math.max(box.l - cx, 0, cx - box.r), Math.max(box.t - cy, 0, cy - box.b));
          };
          for (const h of revealGeo.hits) {
            if (!h.own) {
              failures.push(`/ @ ${width}x${height}: hit ${h.target} has no leaves carrying its data-hit`);
              continue;
            }
            const ownDist = centreDist(h.own, h);
            if (ownDist > 6) failures.push(`/ @ ${width}x${height}: hit ${h.target} centre sits ${Math.round(ownDist)}px off its own linework`);
            h.others.forEach((o, i) => {
              if (!o) return;
              const otherDist = centreDist(o, h);
              if (ownDist > otherDist + 2) {
                failures.push(`/ @ ${width}x${height}: hit ${h.target} sits closer to another target's linework (${Math.round(otherDist)}px vs ${Math.round(ownDist)}px, ${TARGET_IDS.filter((x) => x !== h.target)[i]})`);
              }
            });
          }
        }
        if (hitsInteractive) {
          // hover paints the component's own linework (differential: every one
          // of its elements must change) and nothing else on the drawing may
          // change -- the control is the full complement of leaves
        // every painted thing: tagged leaves, every label (tagged or not), the
        // untagged background rect and the pattern geometry in <defs> -- a rule
        // matching bare svg text/path/rect must not slip the complement control
        // (R2 finding 1, R3 finding 1)
        const readLeaves = () => page.evaluate(() => [...document.querySelectorAll(".hero-sld svg [pathLength], .hero-sld svg text:not([pathLength]), .hero-sld svg rect:not([pathLength]), .hero-sld svg path:not([pathLength])")].map((el) => ({
            hit: el.getAttribute("data-hit"),
            s: getComputedStyle(el).stroke,
            f: getComputedStyle(el).fill,
            w: getComputedStyle(el).strokeWidth,
            g: getComputedStyle(el).fontWeight,
            d: getComputedStyle(el).textDecorationLine,
            o: getComputedStyle(el).opacity,
          })));
          for (const t of TARGET_IDS) {
            await page.mouse.move(0, 0);
            await page.waitForTimeout(40);
            const beforePaint = await readLeaves();
            await page.hover(`.hero-sld-hit[data-target="${t}"]`);
            await page.waitForTimeout(40);
            const afterPaint = await readLeaves();
            const ownChanged = beforePaint.every((b, i) => b.hit !== t || b.s !== afterPaint[i].s || b.f !== afterPaint[i].f || b.w !== afterPaint[i].w || b.g !== afterPaint[i].g || b.d !== afterPaint[i].d || b.o !== afterPaint[i].o);
            const ownCount = beforePaint.filter((b) => b.hit === t).length;
            if (ownCount === 0) failures.push(`/ @ ${width}x${height}: hovering ${t} found no elements carrying its data-hit`);
            if (!ownChanged) failures.push(`/ @ ${width}x${height}: hovering ${t} must paint every one of its elements`);
            const leaked = beforePaint.filter((b, i) => b.hit !== t && (b.s !== afterPaint[i].s || b.f !== afterPaint[i].f || b.w !== afterPaint[i].w || b.g !== afterPaint[i].g || b.d !== afterPaint[i].d || b.o !== afterPaint[i].o));
            if (leaked.length) failures.push(`/ @ ${width}x${height}: hovering ${t} must not paint other components (${leaked.length} leaf/leaves changed, e.g. ${leaked[0].hit})`);
            if (t !== "vd") {
              const ownWidths = afterPaint.filter((b) => b.hit === t).map((b) => b.w);
              if (ownWidths.some((w) => parseFloat(w) < 3)) failures.push(`/ @ ${width}x${height}: hovering ${t} must not thin its linework (${ownWidths.join()})`);
            }
          }
          // the voltage-drop target is a text label: painting must not drop it
          // below 4.5:1 (it ships at 6.2:1 on paper), so the cue is weight + rule
          await page.hover('.hero-sld-hit[data-target="vd"]');
          const vdPaint = await page.evaluate(() => {
            const el = document.querySelector('.hero-sld svg [data-hit="vd"]');
            const cs = getComputedStyle(el);
            return { fill: cs.fill, weight: Number(cs.fontWeight), decoration: cs.textDecorationLine };
          });
          if (vdPaint.fill !== "rgb(159, 53, 16)" || vdPaint.weight < 700 || !vdPaint.decoration.includes("underline")) {
            failures.push(`/ @ ${width}x${height}: the painted voltage-drop label must stay legible (accent-dark, 700, underlined): ${JSON.stringify(vdPaint)}`);
          }
          await page.mouse.move(0, 0);
        }
        // click reveal (sticky), second activation returns, Escape returns, the
        // close button returns; keyboard goes through the rows. The legend must
        // never blank on the way back (R1 F1) and the drawing must never re-plot.
        const heightOf = () => page.evaluate(() => Math.round(document.querySelector(".hero-artifact-figure").getBoundingClientRect().height));
        const plotState = () => page.evaluate(() => {
          const leaves = [...document.querySelectorAll(".hero-sld svg [pathLength]")];
          const offsets = leaves.map((el) => parseFloat(getComputedStyle(el).strokeDashoffset));
          return { max: Math.max(...offsets), running: document.getAnimations().filter((a) => a.animationName === "plot" && a.playState === "running").length };
        });
        const legendState = () => page.evaluate(() => {
          const rows = [...document.querySelectorAll(".hero-sld-row")];
          return {
            visibility: getComputedStyle(document.querySelector(".hero-sld-rows")).visibility,
            minOpacity: Math.min(...rows.map((el) => Number(getComputedStyle(el).opacity))),
            pings: document.getAnimations().filter((a) => a.animationName === "callout-ping" && a.playState === "running").length,
          };
        });
        const waitActive = (value) => page.waitForFunction((v) => document.querySelector(".hero-artifact-figure").getAttribute("data-active") === v, value, { timeout: 4000 });
        const beforeH = await heightOf();
        if (width === 1440) {
          const paintOf = (id) => page.evaluate((sel) => [...document.querySelectorAll(`.hero-sld svg [data-hit="${sel}"]`)].map((el) => getComputedStyle(el).stroke + "|" + getComputedStyle(el).fill + "|" + getComputedStyle(el).strokeWidth), id);
          const mainsBefore = await paintOf("mains");
          await page.click('.hero-sld-hit[data-target="mains"]');
          await page.mouse.move(0, 0);
          await waitActive("mains");
          const mainsAfter = await paintOf("mains");
          if (mainsBefore.join() === mainsAfter.join()) {
            failures.push(`/ @ ${width}x${height}: an open detail must paint its component (active state)`);
          }
          const openH = await heightOf();
          if (Math.abs(openH - beforeH) > 1) failures.push(`/ @ ${width}x${height}: the figure must not resize when a detail opens (${beforeH} -> ${openH})`);
          const openPlot = await plotState();
          if (openPlot.max > 0.02 || openPlot.running !== 0) failures.push(`/ @ ${width}x${height}: opening a detail must not replay the plot (${JSON.stringify(openPlot)})`);
          const openRows = await legendState();
          if (openRows.visibility !== "hidden") failures.push(`/ @ ${width}x${height}: the rows give way to the open detail (${JSON.stringify(openRows)})`);
          await page.click('.hero-sld-hit[data-target="mains"]');
          await waitActive(null);
          const closed = await legendState();
          if (closed.visibility !== "visible" || closed.minOpacity < 1 || closed.pings !== 0) {
            failures.push(`/ @ ${width}x${height}: returning to the legend must not blank it (${JSON.stringify(closed)})`);
          }
          const closedPlot = await plotState();
          if (closedPlot.max > 0.02 || closedPlot.running !== 0) failures.push(`/ @ ${width}x${height}: closing a detail must not replay the plot (${JSON.stringify(closedPlot)})`);
        }
        const openFromRow = async (id) => {
          await page.focus(`.hero-sld-row[data-target="${id}"]`);
          await page.keyboard.press("Enter");
          await waitActive(id);
          return page.evaluate(() => {
            const el = document.activeElement;
            return { cls: el?.className ?? "", target: el?.getAttribute?.("data-target") ?? null, tabindex: el?.getAttribute?.("tabindex") ?? null };
          });
        };
        const rowFocus = await openFromRow("sup");
        const rowOpenH = await heightOf();
        if (Math.abs(rowOpenH - beforeH) > 1) failures.push(`/ @ ${width}x${height}: the row path must not resize the figure (${beforeH} -> ${rowOpenH})`);
        if (rowFocus.cls !== "hero-sld-detail" || rowFocus.target !== "sup" || rowFocus.tabindex !== "-1") {
          failures.push(`/ @ ${width}x${height}: opening from a row must move focus into the detail (${JSON.stringify(rowFocus)})`);
        }
        const rowPlot = await plotState();
        if (rowPlot.max > 0.02 || rowPlot.running !== 0) failures.push(`/ @ ${width}x${height}: the row path must not replay the plot (${JSON.stringify(rowPlot)})`);
        const closeBox = await page.evaluate(() => {
          const el = document.querySelector('.hero-sld-detail[data-target="sup"] .hero-sld-detail-close');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 };
        });
        if (!closeBox || !closeBox.visible || closeBox.w < 24 || closeBox.h < 24) {
          failures.push(`/ @ ${width}x${height}: the open detail must carry a >=24px close button (${JSON.stringify(closeBox)})`);
        }
        await page.keyboard.press("Escape");
        await waitActive(null);
        const escaped = await page.evaluate(() => ({ cls: document.activeElement?.className ?? "", target: document.activeElement?.getAttribute?.("data-target") ?? null }));
        if (escaped.cls !== "hero-sld-row" || escaped.target !== "sup") {
          failures.push(`/ @ ${width}x${height}: Escape must hand focus back to the row that opened the detail (${JSON.stringify(escaped)})`);
        }
        const escLegend = await legendState();
        if (escLegend.visibility !== "visible" || escLegend.minOpacity < 1 || escLegend.pings !== 0) {
          failures.push(`/ @ ${width}x${height}: Escape must return to a settled legend (${JSON.stringify(escLegend)})`);
        }
        // the close button is the touch way back (no Escape on a phone)
        const butFocus = await openFromRow("but");
        if (butFocus.cls !== "hero-sld-detail") failures.push(`/ @ ${width}x${height}: the row path must open the detail (${JSON.stringify(butFocus)})`);
        await page.click('.hero-sld-detail[data-target="but"] .hero-sld-detail-close');
        await waitActive(null);
        const closedByButton = await page.evaluate(() => ({ cls: document.activeElement?.className ?? "", target: document.activeElement?.getAttribute?.("data-target") ?? null }));
        const btnLegend = await legendState();
        if (closedByButton.cls !== "hero-sld-row" || closedByButton.target !== "but") {
          failures.push(`/ @ ${width}x${height}: the close button must hand focus back to its row (${JSON.stringify(closedByButton)})`);
        }
        if (btnLegend.visibility !== "visible" || btnLegend.minOpacity < 1) {
          failures.push(`/ @ ${width}x${height}: the close button must return to the legend (${JSON.stringify(btnLegend)})`);
        }
        }
      }
      if (route === "/about") {
        // Audit 2026-09-24, A1: one ledger at every width, every tool name
        // visible without interaction; two columns above 720px, one below.
        const ledger = page.locator("[data-tools-ledger]");
        if (!(await ledger.isVisible())) failures.push(`/about @ ${width}x${height}: proof ledger is hidden`);
        const capabilityBoxes = await ledger.locator(".tools-proof-capability").evaluateAll((nodes) => nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { top: Math.round(box.top), bottom: Math.round(box.bottom), left: Math.round(box.left), right: Math.round(box.right) };
        }));
        if (capabilityBoxes.length !== 4) failures.push(`/about @ ${width}x${height}: proof ledger has ${capabilityBoxes.length} capabilities, expected 4`);
        else if (width > 720) {
          const [first, second] = capabilityBoxes;
          if (first.top !== second.top || second.left <= first.right) failures.push(`/about @ ${width}x${height}: ledger is not two columns (${JSON.stringify(capabilityBoxes.slice(0, 2))})`);
        } else if (capabilityBoxes.some((box, index) => index > 0 && box.top < capabilityBoxes[index - 1].bottom)) {
          failures.push(`/about @ ${width}x${height}: ledger capabilities overlap or sit side by side at a stacked width`);
        }
        if (!(await ledger.getByText("KiCad", { exact: false }).first().isVisible())) failures.push(`/about @ ${width}x${height}: tool names are not visible without interaction`);
        // Audit 2026-09-24, A2: each timeline step puts date and role beside
        // its text above 720px and above it when stacked.
        const steps = await page.locator("[data-about-timeline] > li").evaluateAll((items) => items.map((item) => {
          const head = item.querySelector(":scope > div")?.getBoundingClientRect();
          const body = item.querySelector(":scope > p")?.getBoundingClientRect();
          return head && body ? { headRight: Math.round(head.right), headBottom: Math.round(head.bottom), bodyLeft: Math.round(body.left), bodyTop: Math.round(body.top), headTop: Math.round(head.top) } : null;
        }));
        if (steps.length !== 5 || steps.includes(null)) failures.push(`/about @ ${width}x${height}: timeline has ${steps.length} well-formed steps, expected 5`);
        else if (width > 720 && steps.some((step) => step.bodyLeft < step.headRight || step.bodyTop !== step.headTop)) failures.push(`/about @ ${width}x${height}: timeline text does not sit beside its date and role (${JSON.stringify(steps[0])})`);
        else if (width <= 720 && steps.some((step) => step.bodyTop < step.headBottom)) failures.push(`/about @ ${width}x${height}: stacked timeline text overlaps its date and role`);
        if (width === 390 || width === 1440) {
          await page.evaluate(() => {
            for (const selector of [".site-header", ".skip-link"]) {
              const node = /** @type {HTMLElement | null} */ (document.querySelector(selector));
              if (node) node.style.display = "none";
            }
          });
          await page.locator("#tools-and-standards").screenshot({ path: join(SHOT_DIR, `about-tools-${width}x${height}.png`) });
          await page.evaluate(() => {
            for (const selector of [".site-header", ".skip-link"]) {
              const node = /** @type {HTMLElement | null} */ (document.querySelector(selector));
              if (node) node.style.removeProperty("display");
            }
          });
        }
      }
      if (route === "/projects/lv-cabling-design-commercial-complex" || route === "/resume") {
        // Standalone links (not inline in a sentence) carry the repo's 44px
        // floor, matching .homepage-epilogue-collection and the contact links.
        const standalone = page.locator(".back-link, .case-image-note .text-link, .profile-facts .text-link");
        for (let index = 0; index < (await standalone.count()); index += 1) {
          const box = await standalone.nth(index).evaluate((node) => { const rect = node.getBoundingClientRect(); return { height: rect.height, text: node.textContent.trim().slice(0, 30) }; });
          if (box.height < 44) failures.push(`${route} @ ${width}x${height}: standalone link "${box.text}" is ${Math.round(box.height)}px tall, below 44px`);
        }
      }
      if (route === "/projects/lv-cabling-design-commercial-complex") {
        // The subcircuit schedule is eight nowrap columns. Scrolled right, the
        // load-name row header must stay pinned or the remaining seven columns
        // are unlabelled numbers. Asserts tbody th only: that is the visible
        // defect. thead th:first-child is pinned by the same rule as a
        // consequence, not as a second behaviour.
        const scroller = page.locator(".table-scroll").first();
        if (await scroller.count()) {
          const pinned = await scroller.evaluate((node) => {
            const cell = node.querySelector("tbody th");
            if (!cell) return null;
            const before = cell.getBoundingClientRect().left;
            node.scrollLeft = node.scrollWidth - node.clientWidth;
            const style = getComputedStyle(cell);
            return { before, after: cell.getBoundingClientRect().left, position: style.position, background: style.backgroundColor, overflowed: node.scrollWidth > node.clientWidth };
          });
          // Guarded on overflowed: at wide viewports the table fits and the
          // sticky behaviour is unobservable, which is correct, not a failure.
          if (pinned && pinned.overflowed) {
            if (pinned.position !== "sticky") failures.push(`${route} @ ${width}x${height}: table row header is not sticky`);
            if (Math.abs(pinned.after - pinned.before) > 1) failures.push(`${route} @ ${width}x${height}: table row header scrolled out of view by ${Math.round(Math.abs(pinned.after - pinned.before))}px`);
            if (/rgba\(0, 0, 0, 0\)|transparent/.test(pinned.background)) failures.push(`${route} @ ${width}x${height}: sticky row header has no background and will show scrolled content through it`);
          }
        }
      }
      if (route === "/contact") {
        const snapshot = page.locator("[data-technical-snapshot]");
        const groups = page.locator("[data-snapshot-group]");
        const contactColumn = page.locator(".contact-column");
        const actions = page.locator(".contact-actions");
        const compactFooter = page.locator('[data-footer-variant="compact"]');
        if (await snapshot.count() !== 1) failures.push("/contact @ " + width + "x" + height + ": Technical Snapshot count is not 1");
        if (await groups.count() !== 5) failures.push("/contact @ " + width + "x" + height + ": snapshot group count is " + await groups.count() + ", expected 5");
        const groupOrder = await groups.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-snapshot-group")));
        if (groupOrder.join(",") !== "current-role,studying,verified-power,current-build,path") {
          failures.push("/contact @ " + width + "x" + height + ": snapshot group order is " + groupOrder.join(","));
        }
        const groupMetrics = await groups.evaluateAll((nodes) => nodes.map((node) => {
          const style = getComputedStyle(node);
          const label = node.querySelector(".technical-snapshot-label");
          const value = node.querySelector(".technical-snapshot-value, .technical-snapshot-links a");
          const labelRect = label?.getBoundingClientRect();
          const valueRect = value?.getBoundingClientRect();
          return {
            paddingTop: parseFloat(style.paddingTop),
            paddingBottom: parseFloat(style.paddingBottom),
            labelValueGap: labelRect && valueRect ? valueRect.top - labelRect.bottom : -1,
          };
        }));
        for (const [index, metric] of groupMetrics.entries()) {
          if (Math.abs(metric.paddingTop - 16) > 1 || Math.abs(metric.paddingBottom - 16) > 1) {
            failures.push("/contact @ " + width + "x" + height + ": snapshot group " + (index + 1) + " padding is not 1rem");
          }
          if (metric.labelValueGap < 4 - 1 || metric.labelValueGap > 8 + 1) {
            failures.push("/contact @ " + width + "x" + height + ": snapshot group " + (index + 1) + " label/value gap is " + Math.round(metric.labelValueGap) + "px");
          }
        }
        const valueStyles = await snapshot.locator(".technical-snapshot-value").evaluateAll((nodes) =>
          nodes.map((node) => {
            const style = getComputedStyle(node);
            return { family: style.fontFamily, weight: style.fontWeight };
          }),
        );
        for (const valueStyle of valueStyles) {
          if (!valueStyle.family.includes("Inter") || valueStyle.family.toLowerCase().includes("mono") || valueStyle.weight !== "600") {
            failures.push("/contact @ " + width + "x" + height + ": snapshot primary value typography is not Inter 600");
          }
        }
        const headingStyle = await snapshot.locator(".technical-snapshot-heading").evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            borderTop: style.borderTopWidth,
            borderBottom: style.borderBottomWidth,
            background: style.backgroundColor,
            radius: style.borderRadius,
            shadow: style.boxShadow,
          };
        });
        const expectedHeadingTop = width <= 720 ? "1px" : "0px";
        if (headingStyle.borderTop !== expectedHeadingTop || headingStyle.borderBottom !== "1px" || headingStyle.radius !== "0px" || headingStyle.shadow !== "none") {
          failures.push("/contact @ " + width + "x" + height + ": snapshot heading rules/furniture are incorrect (borderTop " + headingStyle.borderTop + ")");
        }
        const verifiedLinks = page.locator("[data-contact-verified-link]");
        if (await verifiedLinks.count() !== 2) failures.push("/contact @ " + width + "x" + height + ": verified-power link count is not 2");
        const linkMetrics = await verifiedLinks.evaluateAll((nodes) => nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return { left: rect.left, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height, borderLeft: style.borderLeftWidth, borderTop: style.borderTopWidth };
        }));
        for (const [index, metric] of linkMetrics.entries()) {
          if (metric.width < 44 || metric.height < 44) failures.push("/contact @ " + width + "x" + height + ": verified link " + (index + 1) + " misses 44px target");
          await verifiedLinks.nth(index).focus();
          const focus = await verifiedLinks.nth(index).evaluate((node) => {
            const style = getComputedStyle(node);
            return { outline: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth) };
          });
          if (focus.outline === "none" || focus.outlineWidth < 2) failures.push("/contact @ " + width + "x" + height + ": verified link " + (index + 1) + " lacks focus outline");
        }
        if (width >= 721 && linkMetrics.length === 2 && Math.abs(linkMetrics[0].top - linkMetrics[1].top) > 1) {
          failures.push("/contact @ " + width + "x" + height + ": verified links are not in desktop columns");
        }
        if (width <= 720 && linkMetrics.length === 2 && linkMetrics[1].top < linkMetrics[0].bottom - 1) {
          failures.push("/contact @ " + width + "x" + height + ": verified links are not stacked");
        }
        const layoutMetrics = await page.evaluate(() => {
          const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
          const contactRect = rect(".contact-column");
          const actionRect = rect(".contact-actions");
          const snapshotRect = rect("[data-technical-snapshot]");
          const footerRect = rect('[data-footer-variant="compact"]');
          return { contactRect, actionRect, snapshotRect, footerRect };
        });
        if (layoutMetrics.contactRect && layoutMetrics.snapshotRect && layoutMetrics.snapshotRect.top <= layoutMetrics.contactRect.bottom) {
          failures.push(`/contact @ ${width}x${height}: Technical Snapshot does not begin below Contact composition`);
        }
        if (width <= 720 && layoutMetrics.contactRect && layoutMetrics.actionRect && layoutMetrics.snapshotRect && layoutMetrics.footerRect) {
          if (!(layoutMetrics.contactRect.top < layoutMetrics.actionRect.top && layoutMetrics.actionRect.top < layoutMetrics.snapshotRect.top && layoutMetrics.snapshotRect.top < layoutMetrics.footerRect.top)) {
            failures.push("/contact @ " + width + "x" + height + ": mobile reading order is incorrect");
          }
        }
        if (await compactFooter.count() !== 1) failures.push("/contact @ " + width + "x" + height + ": compact footer marker is missing");
      }
      // Row order, 2026-09-17 (Option B): desktop keeps the image left of the
      // copy; mobile stacking follows the DOM (title before image).
      if (route === "/" || route === "/profile") {
        const rowGeometry = await page.evaluate(() => {
          const row = document.querySelector(".project-row");
          if (!row) return null;
          const copy = row.querySelector(".project-copy")?.getBoundingClientRect();
          const image = row.querySelector(".project-image")?.getBoundingClientRect();
          if (!copy || !image) return null;
          return { copyX: Math.round(copy.x), imageX: Math.round(image.x), copyY: Math.round(copy.y), imageY: Math.round(image.y) };
        });
        if (!rowGeometry) failures.push(`${route} @ ${width}x${height}: project row geometry unavailable`);
        else if (width >= 721 && rowGeometry.imageX >= rowGeometry.copyX) failures.push(`${route} @ ${width}x${height}: desktop row must keep the image left of the copy`);
        else if (width <= 720 && rowGeometry.copyY >= rowGeometry.imageY) failures.push(`${route} @ ${width}x${height}: mobile row must stack the copy before the image`);
      }
      // Site screening audit 2026-09-16, F7/F8 (Nathan's go 2026-09-18): the
      // phone sticky label keeps room for the numbers, and each completed
      // study names its next evidence beside the contact line.
      if (route === "/projects/lv-cabling-design-commercial-complex" || route === "/projects/solar-grid-connection-assessment") {
        if (width <= 480) {
          const schedule = await page.evaluate(() => {
            const region = document.querySelector(".writeup .table-scroll");
            const sticky = region?.querySelector("tbody th");
            if (!region || !sticky) return null;
            return { regionW: region.clientWidth, stickyW: Math.round(sticky.getBoundingClientRect().width) };
          });
          if (!schedule) failures.push(`${route} @ ${width}x${height}: writeup table region missing`);
          else {
            if (schedule.stickyW > schedule.regionW * 0.45 + 2) failures.push(`${route} @ ${width}x${height}: sticky label column is ${schedule.stickyW}px of ${schedule.regionW}px (limit 45%)`);
            if (schedule.regionW - schedule.stickyW < 100) failures.push(`${route} @ ${width}x${height}: numeric area right of the sticky label is ${schedule.regionW - schedule.stickyW}px (min 100px)`);
          }
        }
        const nextLink = await page.evaluate(() => {
          const node = document.querySelector(".case-next .text-link");
          if (!node) return null;
          const box = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return { w: Math.round(box.width), h: Math.round(box.height), visible: style.visibility !== "hidden" && Number(style.opacity) > 0.9 };
        });
        if (!nextLink) failures.push(`${route} @ ${width}x${height}: next-evidence link missing`);
        else if (!nextLink.visible || nextLink.w < 60 || nextLink.h < 12) failures.push(`${route} @ ${width}x${height}: next-evidence link not visibly rendered (${JSON.stringify(nextLink)})`);
      }
      // Site screening audit 2026-09-16, F3: a case study must state its
      // contribution and outcome within one scroll of the top, and the opening
      // card must sit clear of the spec table (its -1.2rem pull must be
      // neutralised -- Nathan, 2026-09-17).
      if (route.startsWith("/projects/")) {
        const opening = await page.evaluate(() => {
          const card = document.querySelector(".case-opening");
          const spec = document.querySelector(".case-spec");
          return {
            top: card ? Math.round(card.getBoundingClientRect().top) : null,
            bottom: card ? Math.round(card.getBoundingClientRect().bottom) : null,
            specTop: spec ? Math.round(spec.getBoundingClientRect().top) : null,
          };
        });
        if (opening.top === null) failures.push(`${route} @ ${width}x${height}: case-study opening block missing`);
        else if (opening.top > height * 2) failures.push(`${route} @ ${width}x${height}: case-study opening sits at ${opening.top}px, beyond one scroll`);
        if (opening.specTop !== null && opening.bottom !== null && opening.specTop < opening.bottom) {
          failures.push(`${route} @ ${width}x${height}: spec table starts at ${opening.specTop}px, inside the opening card (bottom ${opening.bottom}px)`);
        }
      }

      if (route === "/projects") {
        const expectedSlugs = [
          "lv-cabling-design-commercial-complex",
          "solar-grid-connection-assessment",
          "gps-denied-autonomous-uav",
        ];
        const journeys = page.locator("[data-project-journeys]");
        const portals = page.locator("[data-project-slug]");
        const links = page.locator("[data-project-journey-link]");
        const images = page.locator(".project-journey-image img");
        const portalCount = await portals.count();
        const linkCount = await links.count();
        const imageCount = await images.count();
        if ((await journeys.count()) !== 1) failures.push(`/projects @ ${width}x${height}: journey map count is not 1`);
        if (portalCount !== 3) failures.push(`/projects @ ${width}x${height}: lane count is ${portalCount}, expected 3`);
        if (linkCount !== 3) failures.push(`/projects @ ${width}x${height}: journey link count is ${linkCount}, expected 3`);
        if (imageCount !== 3) failures.push(`/projects @ ${width}x${height}: journey miniature count is ${imageCount}, expected 3`);

        const renderedSlugs = await portals.evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("data-project-slug")),
        );
        if (renderedSlugs.join(",") !== expectedSlugs.join(",")) {
          failures.push(`/projects @ ${width}x${height}: DOM order is ${renderedSlugs.join(",")}`);
        }

        const portalBoxes = await portals.evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return { left: rect.left, top: rect.top, bottom: rect.bottom };
          }),
        );
        if (portalBoxes.length === 3 && width >= 721) {
          const stageColumns = await page.locator(".project-journey-stages").evaluateAll((nodes) =>
            nodes.map((node) => Array.from(node.children).map((stage) => {
              const rect = stage.getBoundingClientRect();
              return { left: rect.left, width: rect.width, top: rect.top, bottom: rect.bottom };
            })),
          );
          const alignedStages = stageColumns.length === 3 &&
            stageColumns.every((columns) => columns.length === 3) &&
            [0, 1, 2].every((column) => {
              const lefts = stageColumns.map((columns) => columns[column].left);
              return Math.max(...lefts) - Math.min(...lefts) <= 1;
            });
          if (!alignedStages) failures.push(`/projects @ ${width}x${height}: process columns are not aligned`);
        }
        if (portalBoxes.length === 3 && width >= 961) {
          const heroHeight = await page.locator(".projects-hero").evaluate((node) => node.getBoundingClientRect().height);
          if (heroHeight > 275) failures.push(`/projects @ ${width}x${height}: compact hero height is ${Math.round(heroHeight)}px`);
          const thirdLaneTop = portalBoxes[2].top;
          if (width === 1440 && thirdLaneTop > 865) failures.push(`/projects @ ${width}x${height}: third lane begins at ${Math.round(thirdLaneTop)}px`);
          const visibleStarts = await page.locator(".project-journey-image").evaluateAll((nodes) =>
            nodes.map((node) => node.getBoundingClientRect().top < 900),
          );
          if (width === 1440 && visibleStarts.some((visible) => !visible)) failures.push(`/projects @ ${width}x${height}: not all miniature tops are visible before first viewport`);
          const gpsCurrent = await page.locator('[data-project-slug="gps-denied-autonomous-uav"] [data-journey-stage="current"] .project-journey-stage-state').textContent();
          const gpsFuture = await page.locator('[data-project-slug="gps-denied-autonomous-uav"] [data-journey-stage="future"] .project-journey-stage-state').textContent();
          if (!gpsCurrent?.includes("Current") || !gpsFuture?.includes("Future")) failures.push(`/projects @ ${width}x${height}: UAV current/future states are not visibly labelled`);
        }

        if (linkCount === 3) {
          await links.first().focus();
          for (let index = 0; index < expectedSlugs.length; index += 1) {
            const activeSlug = await page.evaluate(() =>
              document.activeElement?.closest("[data-project-slug]")?.getAttribute("data-project-slug") ?? "",
            );
            if (activeSlug !== expectedSlugs[index]) {
              failures.push(`/projects @ ${width}x${height}: tab order ${index + 1} is ${activeSlug || "missing"}`);
              break;
            }
            if (index < expectedSlugs.length - 1) await page.keyboard.press("Tab");
          }
        }

        const imageMetrics = await images.evaluateAll((nodes) =>
          nodes.map((node) => {
            const image = /** @type {HTMLImageElement} */ (node);
            const rect = image.getBoundingClientRect();
            return { width: rect.width, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
          }),
        );
        for (const [index, metric] of imageMetrics.entries()) {
          if (metric.naturalWidth !== 1280 || metric.naturalHeight !== 720) failures.push(`/projects @ ${width}x${height}: journey miniature ${index + 1} source is ${metric.naturalWidth}x${metric.naturalHeight}`);
          const widthBand = width >= 1200 ? [190, 250] : width >= 961 ? [145, 195] : width >= 721 ? [110, 155] : null;
          if (widthBand && (metric.width < widthBand[0] || metric.width > widthBand[1])) failures.push(`/projects @ ${width}x${height}: journey miniature ${index + 1} renders ${Math.round(metric.width)}px wide`);
          if (width <= 720) {
            const availableWidth = await images.nth(index).evaluate((node) => Math.min(640, node.parentElement?.parentElement?.getBoundingClientRect().width ?? 0));
            if (Math.abs(metric.width - availableWidth) > 2) failures.push(`/projects @ ${width}x${height}: mobile miniature ${index + 1} is ${Math.round(metric.width)}px, expected ${Math.round(availableWidth)}px`);
          }
        }

        if (width <= 720) {
          const tops = await portals.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
          for (let index = 1; index < tops.length; index += 1) {
            if (tops[index] <= tops[index - 1]) failures.push(`/projects @ ${width}x${height}: mobile lane tops are not strictly increasing`);
          }
          // Site screening audit 2026-09-16, F2: on mobile the index must name
          // projects inside the first viewport, and the headline must stay a
          // short title rather than a full sentence stack.
          const mobileIndex = await page.evaluate(() => {
            const heading = document.querySelector(".projects-hero h1");
            const first = document.querySelector("[data-project-slug]");
            return {
              headingHeight: heading ? Math.round(heading.getBoundingClientRect().height) : null,
              firstProjectTop: first ? Math.round(first.getBoundingClientRect().top) : Number.POSITIVE_INFINITY,
            };
          });
          if (mobileIndex.headingHeight === null) {
            failures.push(`/projects @ ${width}x${height}: projects headline not found`);
          } else if (mobileIndex.headingHeight > 245) {
            failures.push(`/projects @ ${width}x${height}: projects headline is ${mobileIndex.headingHeight}px tall (budget 245px)`);
          }
          if (mobileIndex.firstProjectTop >= height) failures.push(`/projects @ ${width}x${height}: first named project begins at ${mobileIndex.firstProjectTop}px, below the first viewport`);
        }

        for (let index = 0; index < linkCount; index += 1) {
          const link = links.nth(index);
          await link.focus();
          const focus = await link.evaluate((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), width: rect.width, height: rect.height };
          });
          if (focus.outlineStyle === "none" || focus.outlineWidth < 2) failures.push(`/projects @ ${width}x${height}: journey link ${index + 1} lacks non-colour focus outline`);
          if (focus.width < 44 || focus.height < 44) failures.push(`/projects @ ${width}x${height}: journey link ${index + 1} misses 44px touch target`);
        }
      }
      const slug = route === "/" ? "home" : route.replaceAll("/", "_").replace(/^_/, "");
      await page.screenshot({ path: join(SHOT_DIR, `${slug}-${width}x${height}.png`), fullPage: false });
    }
    await page.close();
  }

  for (const [width, height] of CONTACT_VIEWPORTS) {
    const contactPage = await browser.newPage({ viewport: { width, height } });
    const response = await contactPage.goto(`${base}/contact`, { waitUntil: "networkidle" });
    checks += 1;
    if (!response || !response.ok()) {
      failures.push(`/contact @ ${width}x${height}: HTTP ${response ? response.status() : "no response"}`);
      await contactPage.close();
      continue;
    }
    await contactPage.evaluate(() => document.fonts.ready);
    const metrics = await contactPage.evaluate((viewportWidth) => {
      const selectors = {
        column: ".contact-column",
        hero: ".contact-column h1",
        details: ".contact-details",
        actions: ".contact-actions",
        email: ".contact-email-link",
        copy: ".contact-actions button",
        snapshot: "[data-technical-snapshot]",
        heading: ".technical-snapshot-heading",
        role: '[data-snapshot-group="current-role"]',
        study: '[data-snapshot-group="studying"]',
        verified: '[data-snapshot-group="verified-power"]',
        build: '[data-snapshot-group="current-build"]',
        path: '[data-snapshot-group="path"]',
        footer: '[data-footer-variant="compact"]',
      };
      const toRect = (node) => {
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
      };
      const styleData = (node) => {
        if (!node) return null;
        const style = getComputedStyle(node);
        return {
          paddingLeft: parseFloat(style.paddingLeft),
          paddingRight: parseFloat(style.paddingRight),
          borderLeft: parseFloat(style.borderLeftWidth),
          borderBottom: parseFloat(style.borderBottomWidth),
          borderTop: parseFloat(style.borderTopWidth),
          rowGap: parseFloat(style.rowGap),
          columnGap: parseFloat(style.columnGap),
          display: style.display,
          gridTemplateColumns: style.gridTemplateColumns,
          clientWidth: node.clientWidth,
          clientHeight: node.clientHeight,
          scrollWidth: node.scrollWidth,
          scrollHeight: node.scrollHeight,
        };
      };
      const rangeCount = (node) => {
        const textNode = Array.from(node?.childNodes ?? []).find((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim());
        if (!textNode) return 0;
        const range = document.createRange();
        range.selectNodeContents(textNode);
        return range.getClientRects().length;
      };
      const snapshotNode = document.querySelector(selectors.snapshot);
      const snapshotRect = toRect(snapshotNode);
      const columns = viewportWidth >= 1240 ? 6 : viewportWidth <= 720 ? 1 : 2;
      const groupNodes = Array.from(document.querySelectorAll("[data-snapshot-group]"));
      const rects = Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name, toRect(document.querySelector(selector))]));
      const styles = Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name, styleData(document.querySelector(selector))]));
      const groups = groupNodes.map((node) => {
        const rect = toRect(node);
        return {
          name: node.getAttribute("data-snapshot-group"),
          rect,
          style: styleData(node),
          span: snapshotRect && rect ? Math.round((rect.width / (snapshotRect.width / columns)) * 100) / 100 : 0,
        };
      });
      const focusables = Array.from(document.querySelectorAll(".contact-email-link, .contact-actions button, [data-contact-verified-link]"));
      const focusOrder = focusables.map((node, index) => {
        const rect = node.getBoundingClientRect();
        return { index, top: rect.top, left: rect.left };
      });
      const section = document.querySelector(".contact-hero");
      const sectionRect = toRect(section);
      return {
        rects,
        styles,
        groups,
        groupOrder: groupNodes.map((node) => node.getAttribute("data-snapshot-group")),
        focusOrder,
        heroRangeCount: rangeCount(document.querySelector(selectors.hero)),
        sectionRect,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        contactSectionOverflow: section ? section.scrollWidth - section.clientWidth : 0,
        navOverflow: (() => {
          const nav = document.querySelector(".site-nav");
          return Boolean(nav && (nav.scrollWidth > nav.clientWidth + 1 || nav.getBoundingClientRect().right > document.documentElement.clientWidth + 1));
        })(),
      };
    }, width);
    const prefix = `/contact @ ${width}x${height}`;
    const rect = (name) => metrics.rects[name];
    const style = (name) => metrics.styles[name];
    const inside = (child, parent) => Boolean(child && parent && child.left >= parent.left - 1 && child.right <= parent.right + 1 && child.top >= parent.top - 1 && child.bottom <= parent.bottom + 1);
    const overlaps = (first, second) => Boolean(first && second && Math.min(first.right, second.right) - Math.max(first.left, second.left) > 1 && Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) > 1);
    const groupNames = { role: "current-role", study: "studying", verified: "verified-power", build: "current-build", path: "path" };
    const groupByName = (name) => metrics.groups.find((group) => group.name === (groupNames[name] ?? name));
    const role = groupByName("current-role");
    const study = groupByName("studying");
    const verified = groupByName("verified-power");
    const build = groupByName("current-build");
    const path = groupByName("path");

    if (!rect("details")) failures.push(`${prefix}: .contact-details is missing`);
    if (metrics.groupOrder.join(",") !== "current-role,studying,verified-power,current-build,path") failures.push(`${prefix}: snapshot group order is ${metrics.groupOrder.join(",")}`);
    if (metrics.documentOverflow > 1) failures.push(`${prefix}: horizontal overflow ${Math.round(metrics.documentOverflow)}px`);
    if (metrics.contactSectionOverflow > 1) failures.push(`${prefix}: Contact section overflow ${Math.round(metrics.contactSectionOverflow)}px`);
    if (!metrics.rects.snapshot || !metrics.rects.footer || !metrics.sectionRect) failures.push(`${prefix}: required Contact containment rectangle is missing`);
    for (const group of metrics.groups) {
      if (!group.rect || !inside(group.rect, metrics.rects.snapshot)) failures.push(`${prefix}: ${group.name} is outside Technical Snapshot`);
      if (group.style?.scrollWidth > group.style?.clientWidth + 1 || group.style?.scrollHeight > group.style?.clientHeight + 1) failures.push(`${prefix}: ${group.name} content clips or overflows its group`);
    }
    for (const [first, second] of [[role, study], [role, path], [role, verified], [role, build], [study, path], [study, verified], [study, build], [path, verified], [path, build], [verified, build]]) {
      if (overlaps(first?.rect, second?.rect)) failures.push(`${prefix}: snapshot groups overlap (${first?.name}, ${second?.name})`);
    }
    for (const name of ["hero", "details", "actions", "snapshot", "heading", "role", "study", "verified", "build", "path"]) {
      if (rect(name) && !inside(rect(name), metrics.sectionRect)) failures.push(`${prefix}: ${name} escapes Contact section`);
    }
    if (rect("column") && rect("snapshot") && rect("snapshot").top <= rect("column").bottom) failures.push(`${prefix}: Technical Snapshot does not begin below Contact composition`);
    if (width >= 1240 && metrics.heroRangeCount !== 1) failures.push(`${prefix}: hero text occupies ${metrics.heroRangeCount} range rectangles`);
    if (style("snapshot") && (style("snapshot").rowGap > 1 || style("snapshot").columnGap > 1)) failures.push(`${prefix}: non-mobile ledger gap is not zero`);
    if (metrics.focusOrder.length === 4) {
      const visualOrder = [...metrics.focusOrder].sort((first, second) => first.top - second.top || first.left - second.left).map((item) => item.index);
      if (visualOrder.join(",") !== "0,1,2,3") failures.push(`${prefix}: focusable visual order is ${visualOrder.join(",")}, expected 0,1,2,3`);
    } else {
      failures.push(`${prefix}: focusable Contact order has ${metrics.focusOrder.length} items, expected 4`);
    }
    if (width <= 720) {
      for (const group of metrics.groups) {
        if (!group.style || Math.abs(group.style.paddingLeft) > 1 || Math.abs(group.style.paddingRight) > 1 || group.style.borderLeft > 1) failures.push(`${prefix}: mobile ${group.name} does not reset horizontal inset/divider`);
      }
      if (rect("actions") && rect("column") && Math.abs(rect("actions").width - rect("column").width) > 1) failures.push(`${prefix}: actions are not full width`);
      for (let index = 1; index < metrics.groups.length; index += 1) {
        if (!metrics.groups[index - 1].rect || !metrics.groups[index].rect || metrics.groups[index].rect.top <= metrics.groups[index - 1].rect.top) failures.push(`${prefix}: mobile group order is not vertically increasing`);
      }
      if (metrics.groups.length === 5) {
        const linkRects = await contactPage.locator("[data-contact-verified-link]").evaluateAll((nodes) => nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom };
        }));
        if (linkRects.length === 2 && linkRects[1].top < linkRects[0].bottom - 1) failures.push(`${prefix}: verified links are not stacked`);
      }
    } else {
      const expectedSpans = width >= 1240 ? { role: 2, study: 2, path: 2, verified: 3, build: 3 } : { role: 1, study: 1, path: 2, verified: 1, build: 1 };
      for (const [name, expected] of Object.entries(expectedSpans)) {
        const group = groupByName(name);
        if (!group || Math.abs(group.span - expected) > 0.1) failures.push(`${prefix}: ${name} spans ${group?.span ?? "missing"} tracks, expected ${expected}`);
      }
      const rowTolerance = 1;
      if (!role?.rect || !study?.rect || Math.abs(role.rect.top - study.rect.top) > rowTolerance) failures.push(`${prefix}: Current Role and Studying are not same visual row`);
      if (!verified?.rect || !build?.rect || Math.abs(verified.rect.top - build.rect.top) > rowTolerance) failures.push(`${prefix}: Verified Power and Current Build are not same visual row`);
      if (width >= 1240) {
        if (!path?.rect || !role?.rect || Math.abs(path.rect.top - role.rect.top) > rowTolerance) failures.push(`${prefix}: Path is not in first ledger row`);
        if (!verified?.rect || !role?.rect || verified.rect.top <= role.rect.bottom - rowTolerance) failures.push(`${prefix}: Verified Power is not below first ledger row`);
      } else {
        if (!path?.rect || !role?.rect || path.rect.top <= role.rect.bottom - rowTolerance) failures.push(`${prefix}: Path is not below first ledger row`);
        if (!verified?.rect || !path?.rect || verified.rect.top <= path.rect.bottom - rowTolerance) failures.push(`${prefix}: Verified Power is not below Path`);
      }
      const expectedBorders = width >= 1240 ? { role: 0, study: 1, path: 1, verified: 0, build: 1 } : { role: 0, study: 1, path: 0, verified: 0, build: 1 };
      for (const [name, expected] of Object.entries(expectedBorders)) {
        const group = groupByName(name);
        if (!group?.style || Math.abs(group.style.borderLeft - expected) > 1) failures.push(`${prefix}: ${name} left divider is ${group?.style?.borderLeft ?? "missing"}px, expected ${expected}px`);
      }
      if (style("details") && (Math.abs(style("details").borderLeft) > 0.5 || Math.abs(style("details").paddingLeft) > 0.5)) {
        failures.push(`${prefix}: Details retains desktop divider/inset`);
      }
      if (style("column") && Math.abs(style("column").borderBottom) > 0.5) {
        failures.push(`${prefix}: contact column retains ink rail (borderBottom ${style("column").borderBottom}px)`);
      }
      if (style("heading")) {
        const expectedHeadingTop = width <= 720 ? 1 : 0;
        if (Math.abs(style("heading").borderTop - expectedHeadingTop) > 0.5) failures.push(`${prefix}: snapshot heading top ink rule is ${style("heading").borderTop}px, expected ${expectedHeadingTop}px`);
      }
      if (width >= 721) {
        if (rect("hero") && rect("details") && rect("hero").bottom > rect("details").top + 1) failures.push(`${prefix}: hero is not above Details`);
      }
      if (width >= 1240) {
        if (rect("actions") && rect("details") && rect("actions").bottom > rect("details").bottom + 1) failures.push(`${prefix}: desktop actions escape Details`);
        if (rect("hero") && rect("details") && Math.abs(rect("hero").left - rect("details").left) > 1) failures.push(`${prefix}: desktop hero and Details do not share a start edge`);
        if (rect("email") && rect("copy") && Math.abs(rect("email").top - rect("copy").top) > 1) failures.push(`${prefix}: email and Copy address do not share one action row`);
      }
    }
    await contactPage.screenshot({ path: join(SHOT_DIR, `contact-${width}x${height}.png`), fullPage: false });
    await contactPage.close();
  }

  for (const [width, height] of CONTACT_TEXT_VIEWPORTS) {
    const contactTextPage = await browser.newPage({ viewport: { width, height } });
    const response = await contactTextPage.goto(`${base}/contact`, { waitUntil: "networkidle" });
    checks += 1;
    if (!response || !response.ok()) {
      failures.push(`/contact @ ${width}x${height} with 200% root text: HTTP ${response ? response.status() : "no response"}`);
      await contactTextPage.close();
      continue;
    }
    await contactTextPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await contactTextPage.evaluate(() => document.fonts.ready);
    const metrics = await contactTextPage.evaluate(() => {
      const toRect = (node) => {
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
      };
      const textNodeRanges = (node, predicate) => {
        if (!node) return [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const ranges = [];
        let current = walker.nextNode();
        while (current) {
          if (predicate(current.textContent ?? "")) {
            const range = document.createRange();
            range.selectNodeContents(current);
            ranges.push({
              text: current.textContent?.trim() ?? "",
              count: range.getClientRects().length,
              rects: Array.from(range.getClientRects()).map((rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom })),
            });
          }
          current = walker.nextNode();
        }
        return ranges;
      };
      const wordRanges = (node) => {
        if (!node) return [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const ranges = [];
        let current = walker.nextNode();
        while (current) {
          for (const match of current.textContent?.matchAll(/\S+/g) ?? []) {
            const range = document.createRange();
            range.setStart(current, match.index ?? 0);
            range.setEnd(current, (match.index ?? 0) + match[0].length);
            ranges.push({ text: match[0], count: range.getClientRects().length });
          }
          current = walker.nextNode();
        }
        return ranges;
      };
      const section = document.querySelector(".contact-hero");
      const footer = document.querySelector('[data-footer-variant="compact"]');
      const sectionRect = toRect(section);
      const footerRect = toRect(footer);
      const groupNodes = Array.from(document.querySelectorAll("[data-snapshot-group]"));
      const contactNodes = [
        document.querySelector(".contact-column h1"),
        document.querySelector(".contact-details"),
        document.querySelector(".contact-actions"),
        document.querySelector(".contact-email-link"),
        document.querySelector(".contact-actions button"),
        document.querySelector("[data-technical-snapshot]"),
        ...groupNodes,
      ];
      return {
        sectionRect,
        footerRect,
        contactRects: contactNodes.map(toRect),
        groups: groupNodes.map(toRect),
        emailBox: toRect(document.querySelector(".contact-email-link")),
        copyBox: toRect(document.querySelector(".contact-actions button")),
        heroWords: wordRanges(document.querySelector(".contact-column h1")),
        emailLabel: textNodeRanges(document.querySelector(".contact-email-link"), (text) => text.includes("@")),
        copyLabel: textNodeRanges(document.querySelector(".contact-actions button"), (text) => /Copy address/i.test(text)),
        sectionOverflow: section ? section.scrollWidth - section.clientWidth : 0,
        footerOverflow: footer ? footer.scrollWidth - footer.clientWidth : 0,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        navOverflow: (() => {
          const nav = document.querySelector(".site-nav");
          return Boolean(nav && (nav.scrollWidth > nav.clientWidth + 1 || nav.getBoundingClientRect().right > document.documentElement.clientWidth + 1));
        })(),
      };
    });
    const prefix = `/contact @ ${width}x${height} with 200% root text`;
    const inside = (child, parent) => Boolean(child && parent && child.left >= parent.left - 1 && child.right <= parent.right + 1 && child.top >= parent.top - 1 && child.bottom <= parent.bottom + 1);
    if (metrics.sectionOverflow > 1) failures.push(`${prefix}: Contact section overflow ${Math.round(metrics.sectionOverflow)}px`);
    if (metrics.footerOverflow > 1) failures.push(`${prefix}: compact footer overflow ${Math.round(metrics.footerOverflow)}px`);
    if (!metrics.sectionRect || !metrics.footerRect || metrics.contactRects.some((rect) => !rect || !inside(rect, metrics.sectionRect))) failures.push(`${prefix}: Contact-owned content escapes its containing block`);
    if (metrics.groups.length !== 5 || metrics.groups.some((rect) => !rect || rect.height <= 0)) failures.push(`${prefix}: not all five snapshot groups remain visible`);
    if (metrics.heroWords.some((word) => word.count !== 1)) failures.push(`${prefix}: hero word splits across ${metrics.heroWords.map((word) => word.count).join(",")} range rectangles`);
    if (metrics.emailLabel.some((label) => label.count !== 1)) failures.push(`${prefix}: email label splits across multiple range rectangles`);
    if (metrics.copyLabel.some((label) => label.count !== 1)) failures.push(`${prefix}: Copy address label splits across multiple range rectangles`);
    if (metrics.emailLabel.some((label) => label.rects.some((rect) => !inside(rect, metrics.emailBox)))) failures.push(`${prefix}: email label escapes its action control`);
    if (metrics.copyLabel.some((label) => label.rects.some((rect) => !inside(rect, metrics.copyBox)))) failures.push(`${prefix}: Copy address label escapes its action control`);
    if (metrics.documentOverflow > 1) {
      if (metrics.navOverflow) informational.push(`${prefix}: document overflow ${Math.round(metrics.documentOverflow)}px attributable to pre-existing .site-nav; Contact/footer containment passed`);
      else failures.push(`${prefix}: horizontal overflow ${Math.round(metrics.documentOverflow)}px outside known .site-nav defect`);
    }
    await contactTextPage.screenshot({ path: join(SHOT_DIR, `contact-${width}x${height}-text-200.png`), fullPage: true });
    await contactTextPage.close();
  }

  {
    const cssSource = await readFile(join("app", "globals.css"), "utf8");
    const desktopBlock = cssSource.match(/@media \(min-width: 1240px\) \{([\s\S]*?)\n\}/);
    const mobileBlock = cssSource.match(/@media \(max-width: 720px\) \{([\s\S]*?)\n\}/);
    if (!desktopBlock) {
      failures.push("globals.css: missing 1240px block");
    } else {
      if (desktopBlock[1].includes(".contact-column")) failures.push("globals.css: 1240px block still styles .contact-column");
      if (desktopBlock[1].includes(".contact-details")) failures.push("globals.css: 1240px block still styles .contact-details");
      if (!desktopBlock[1].includes(".technical-snapshot")) failures.push("globals.css: 1240px block lost .technical-snapshot ledger override");
      if (!desktopBlock[1].includes('data-snapshot-group="path"')) failures.push("globals.css: 1240px block lost path divider rule");
    }
    if (!mobileBlock) {
      failures.push("globals.css: missing 720px block");
    } else {
      if (mobileBlock[1].includes(".contact-column")) failures.push("globals.css: 720px block retains dead .contact-column reset");
      if (mobileBlock[1].includes(".contact-details")) failures.push("globals.css: 720px block retains dead .contact-details reset");
      if (!mobileBlock[1].includes(".technical-snapshot-heading")) failures.push("globals.css: 720px block does not restore snapshot heading ink top rule");
    }
    if (!cssSource.includes(".contact-column { border-bottom: 0; min-width: 0; padding-bottom: 0; }")) {
      failures.push("globals.css: base .contact-column does not match `border-bottom: 0; min-width: 0; padding-bottom: 0;`");
    }
    if (!cssSource.includes(".technical-snapshot-heading { border-bottom: 1px solid var(--line); padding: .7rem 0; }")) {
      failures.push("globals.css: base snapshot heading does not match `border-bottom: 1px solid var(--line); padding: .7rem 0;`");
    }
  }

  for (const width of [721, 768, 840]) {
    const projectTabletPage = await browser.newPage({ viewport: { width, height: 900 } });
    const response = await projectTabletPage.goto(`${base}/projects`, { waitUntil: "networkidle" });
    checks += 1;
    if (!response || !response.ok()) {
      failures.push(`/projects @ ${width}x900: HTTP ${response ? response.status() : "no response"}`);
    } else {
      const boundaryMetrics = await projectTabletPage.locator("[data-project-slug]").evaluateAll((nodes) =>
        nodes.map((node) => {
          const stageRect = node.querySelector(".project-journey-stages")?.getBoundingClientRect();
          const titleRect = node.querySelector(".project-journey-title")?.getBoundingClientRect();
          const actionRect = node.querySelector(".project-journey-action")?.getBoundingClientRect();
          return {
            slug: node.getAttribute("data-project-slug"),
            stageLeft: stageRect?.left ?? 0,
            titleRight: titleRect?.right ?? 0,
            actionRight: actionRect?.right ?? 0,
          };
        }),
      );
      for (const metric of boundaryMetrics) {
        if (metric.titleRight > metric.stageLeft + 1) {
          failures.push(`/projects @ ${width}x900: ${metric.slug} title crosses stage boundary by ${Math.round(metric.titleRight - metric.stageLeft)}px`);
        }
        if (metric.actionRight > metric.stageLeft + 1) {
          failures.push(`/projects @ ${width}x900: ${metric.slug} action crosses stage boundary by ${Math.round(metric.actionRight - metric.stageLeft)}px`);
        }
      }
    }
    await projectTabletPage.close();
  }

  const accessibilityPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await accessibilityPage.goto(`${base}/`, { waitUntil: "networkidle" });
  await accessibilityPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const enlargedOverflow = await accessibilityPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (enlargedOverflow > 1) failures.push(`/ @ 390x844 with 200% root text: horizontal overflow ${enlargedOverflow}px`);
  await accessibilityPage.screenshot({ path: join(SHOT_DIR, "home-390x844-text-200.png"), fullPage: true });

  await accessibilityPage.emulateMedia({ reducedMotion: "reduce" });
  await accessibilityPage.reload({ waitUntil: "networkidle" });
  const reducedDuration = await accessibilityPage.locator(".homepage-portal-image img").first().evaluate(
    (node) => parseFloat(getComputedStyle(node).transitionDuration) || 0,
  );
  if (reducedDuration > 0.01) failures.push(`/ reduced motion: portal image transition remains ${reducedDuration}s`);
  await accessibilityPage.close();

  const projectsAccessibilityPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await projectsAccessibilityPage.goto(`${base}/projects`, { waitUntil: "networkidle" });
  await projectsAccessibilityPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const projectsEnlargedOverflow = await projectsAccessibilityPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (projectsEnlargedOverflow > 1) failures.push(`/projects @ 390x844 with 200% root text: horizontal overflow ${projectsEnlargedOverflow}px`);
  const projectsZoomedHeading = await projectsAccessibilityPage.locator(".projects-hero h1").evaluate((node) => {
    const textNode = Array.from(node.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
    const splitWords = [];
    if (textNode) {
      for (const match of textNode.textContent?.matchAll(/\S+/g) ?? []) {
        const range = document.createRange();
        range.setStart(textNode, match.index ?? 0);
        range.setEnd(textNode, (match.index ?? 0) + match[0].length);
        if (range.getClientRects().length > 1) splitWords.push(match[0]);
      }
    }
    return {
      splitWords,
      clipped: node.scrollWidth > node.clientWidth + 1,
    };
  });
  if (projectsZoomedHeading.splitWords.length > 0 || projectsZoomedHeading.clipped) {
    failures.push(`/projects @ 390x844 with 200% root text: H1 is unreadable (split words ${projectsZoomedHeading.splitWords.join(",") || "none"}, clipped ${projectsZoomedHeading.clipped})`);
  }
  const projectsZoomedJourneys = await projectsAccessibilityPage.locator(".project-journey-stages").evaluateAll((nodes) =>
    nodes.map((node) => {
      const stages = Array.from(node.querySelectorAll(":scope > li"));
      const boxes = stages.map((stage) => stage.getBoundingClientRect());
      const stacked = boxes.every((box, index) => index === 0 || box.top >= boxes[index - 1].bottom + 4);
      const minWidth = boxes.length > 0 ? Math.min(...boxes.map((box) => box.width)) : 0;
      const clipped = stages.some((stage) =>
        stage.scrollWidth > stage.clientWidth + 1 ||
        Array.from(stage.querySelectorAll("span, small")).some((text) => text.scrollWidth > text.clientWidth + 1),
      );
      return { stageCount: stages.length, stacked, minWidth, clipped };
    }),
  );
  if (projectsZoomedJourneys.length !== 3) failures.push(`/projects @ 390x844 with 200% root text: journey count is ${projectsZoomedJourneys.length}, expected 3`);
  for (const [index, journey] of projectsZoomedJourneys.entries()) {
    if (journey.stageCount !== 3 || !journey.stacked || journey.minWidth < 180 || journey.clipped) {
      failures.push(`/projects @ 390x844 with 200% root text: journey ${index + 1} is unreadable (stages ${journey.stageCount}, stacked ${journey.stacked}, min width ${Math.round(journey.minWidth)}px, clipped ${journey.clipped})`);
    }
  }
  await projectsAccessibilityPage.emulateMedia({ reducedMotion: "reduce" });
  await projectsAccessibilityPage.reload({ waitUntil: "networkidle" });
  const projectsReducedDuration = await projectsAccessibilityPage.locator(".project-journey-image img").first().evaluate(
    (node) => parseFloat(getComputedStyle(node).transitionDuration) || 0,
  );
  if (projectsReducedDuration > 0.01) failures.push(`/projects reduced motion: portal image transition remains ${projectsReducedDuration}s`);
  await projectsAccessibilityPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const projectsScreenshotRootSize = await projectsAccessibilityPage.evaluate(
    () => document.documentElement.style.fontSize,
  );
  if (projectsScreenshotRootSize !== "200%") failures.push(`/projects text screenshot: root font size is ${projectsScreenshotRootSize || "unset"}, expected 200%`);
  await projectsAccessibilityPage.screenshot({ path: join(SHOT_DIR, "projects-390x844-text-200.png"), fullPage: true });
  await projectsAccessibilityPage.close();

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(`${base}/`, { waitUntil: "networkidle" });
  const menuButton = mobilePage.locator(".menu-button");
  await menuButton.click();
  if ((await menuButton.getAttribute("aria-expanded")) !== "true") failures.push(`/ mobile menu: button does not report expanded state`);
  await mobilePage.keyboard.press("Escape");
  if ((await menuButton.getAttribute("aria-expanded")) !== "false") failures.push(`/ mobile menu: Escape does not close navigation`);
  const menuRetainsFocus = await menuButton.evaluate((node) => document.activeElement === node);
  if (!menuRetainsFocus) failures.push(`/ mobile menu: Escape does not return focus to menu button`);
  await menuButton.click();
  // Tap the hero credential list: below the open sheet, and never a link, so
  // this cannot navigate away (W3 later makes the hero figure a link).
  await mobilePage.locator(".hero-credential").click({ position: { x: 10, y: 10 } });
  if ((await menuButton.getAttribute("aria-expanded")) !== "false") failures.push(`/ mobile menu: tapping outside the sheet does not close navigation`);
  await mobilePage.close();

  // The homepage lede takes text-wrap: balance, and is deliberately excluded from
  // the text-wrap: pretty rule in globals.css. That rule is later in the file at
  // equal specificity, so re-adding .hero-summary to it would silently revert the
  // balance to pretty with nothing else failing. Assert the computed value.
  const ledePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await ledePage.goto(`${base}/`, { waitUntil: "networkidle" });
  await ledePage.evaluate(() => document.fonts.ready);
  const lede = await ledePage.evaluate(() => {
    const node = document.querySelector(".hero-summary");
    if (!node) return null;
    const range = document.createRange();
    range.selectNodeContents(node);
    return { textWrap: getComputedStyle(node).textWrap, lines: range.getClientRects().length };
  });
  if (!lede) failures.push("/ @ 1440x900: .hero-summary is missing");
  else {
    if (lede.textWrap !== "balance") failures.push(`/ @ 1440x900: .hero-summary text-wrap is ${lede.textWrap}, expected balance`);
    if (lede.lines !== 2) failures.push(`/ @ 1440x900: .hero-summary wraps to ${lede.lines} lines, expected 2`);
  }
  await ledePage.close();

  // Reflow at 200% root text (WCAG 2.1 AA, 1.4.10), swept across every route at
  // the two narrow widths. This sweep used to cover /contact alone, so the rest
  // of the site drifted: at the 2026-09-17 audit 11 of 12 routes scrolled
  // sideways at 320x760 (worst 255px) and 10 of 12 at 390x844 (worst 185px),
  // while every route was clean at default text. A failure reports the element
  // that owns the overflow, located by removal rather than by guessing from
  // geometry, because the cause is usually an intrinsic min-content floor
  // rather than the widest visible box.
  const TEXT_ZOOM_VIEWPORTS = [[320, 760], [390, 844]];
  for (const [width, height] of TEXT_ZOOM_VIEWPORTS) {
    for (const route of ROUTES) {
      const zoomPage = await browser.newPage({ viewport: { width, height } });
      const response = await zoomPage.goto(`${base}${route}`, { waitUntil: "networkidle" });
      checks += 1;
      if (!response || !response.ok()) {
        failures.push(`${route} @ ${width}x${height} with 200% root text: HTTP ${response ? response.status() : "no response"}`);
        await zoomPage.close();
        continue;
      }
      await zoomPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      await zoomPage.evaluate(() => document.fonts.ready);
      const overflow = await zoomPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) {
        const culprit = await zoomPage.evaluate(() => {
          const label = (el) => {
            const cls = (typeof el.className === "string" ? el.className : "").split(" ").filter(Boolean).slice(0, 2).join(".");
            return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${el.id ? "#" + el.id : ""}`;
          };
          const over = () => document.documentElement.scrollWidth - document.documentElement.clientWidth;
          const base = over();
          let node = document.body;
          const path = [];
          for (let depth = 0; depth < 12; depth += 1) {
            let found = null;
            for (const child of node.children) {
              if (getComputedStyle(child).position === "fixed") continue;
              const previous = child.style.display;
              child.style.display = "none";
              const now = over();
              child.style.display = previous;
              if (now < base - 0.5) { found = child; break; }
            }
            if (!found) break;
            path.push(label(found));
            node = found;
          }
          const text = (node.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
          return `${path.join(" > ") || "(body)"} "${text}"`;
        });
        failures.push(`${route} @ ${width}x${height} with 200% root text: document overflows ${overflow}px, owned by ${culprit}`);
      }
      await zoomPage.close();
    }
  }

  // PLAN v7 S2. The case-study spec strip: a non-interactive readout pinned
  // under the header while the write-up is read, visible only at the measured
  // 1100px threshold and up. The reservation in scroll-margin-top depends on
  // the strip's measured height matching --strip-h exactly, so that equality
  // is asserted directly, not inferred. 1099px and 390px prove absence at and
  // below the boundary; scroll-back proves the retract path.
  const STRIP_ROUTES = [
    "/projects/lv-cabling-design-commercial-complex",
    "/projects/solar-grid-connection-assessment",
    "/projects/gps-denied-autonomous-uav",
  ];
  const settleScroll = async (p) => {
    let last = -1;
    let stable = 0;
    for (let i = 0; i < 60 && stable < 3; i += 1) {
      const y = await p.evaluate(() => window.scrollY);
      stable = Math.abs(y - last) < 1 ? stable + 1 : 0;
      last = y;
      if (stable < 3) await p.waitForTimeout(50);
    }
  };
  const scrollPastTable = async (p) => {
    // Two steps (Rev 3): an instant jump from below the fold to past the table
    // crosses no intersection threshold, so the crossing-driven observer never
    // fires and the strip would stay off (observed at 200% text).
    await p.evaluate(() => {
      const table = document.querySelector(".case-spec__table");
      if (table) window.scrollTo({ top: table.getBoundingClientRect().top + window.scrollY + 220, behavior: "instant" });
    });
    await p.waitForTimeout(80);
    await p.evaluate(() => {
      const table = document.querySelector(".case-spec__table");
      if (table) window.scrollTo({ top: table.getBoundingClientRect().bottom + window.scrollY + 400, behavior: "instant" });
    });
  };
  const stripMatrix = [
    [390, 844, ["/projects/lv-cabling-design-commercial-complex"], 100],
    [1099, 800, STRIP_ROUTES, 100],
    [1100, 800, STRIP_ROUTES, 100],
    [1440, 900, STRIP_ROUTES, 100],
    // PLAN v7 Rev 3 (audit C1): the offset scheme was only swept at default
    // text, and at 200% root text the header is a 138px box against the 76px
    // CSS floor. These rows assert the strip's top offset, its height match and
    // the absence of document overflow at zoom. The strip line does not fit its
    // single row at 200% (a clipped, aria-hidden duplicate; the table remains
    // the readable source), so the fit assertion stays a default-text check and
    // the overflow is recorded as informational instead.
    [1100, 800, STRIP_ROUTES, 200],
    [1440, 900, STRIP_ROUTES, 200],
  ];
  for (const [width, height, routes, textZoom] of stripMatrix) {
    for (const route of routes) {
      const stripPage = await browser.newPage({ viewport: { width, height } });
      const response = await stripPage.goto(`${base}${route}`, { waitUntil: "networkidle" });
      checks += 1;
      if (!response || !response.ok()) {
        failures.push(`${route} @ ${width}x${height}: HTTP ${response ? response.status() : "no response"}`);
        await stripPage.close();
        continue;
      }
      await stripPage.evaluate(() => document.fonts.ready);
      if (textZoom !== 100) {
        await stripPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
        await stripPage.evaluate(() => document.fonts.ready);
      }
      await scrollPastTable(stripPage);
      await settleScroll(stripPage);
      const expectOn = width >= 1100;
      if (expectOn) {
        await stripPage.waitForFunction(() => document.querySelector(".case-spec__strip")?.classList.contains("is-on"), null, { timeout: 2000 }).catch(() => {});
      }
      const stripState = await stripPage.evaluate(() => {
        const strip = document.querySelector(".case-spec__strip");
        const header = document.querySelector(".site-header");
        if (!strip || !header) return null;
        const rect = strip.getBoundingClientRect();
        return {
          on: strip.classList.contains("is-on"),
          top: rect.top,
          height: rect.height,
          scrollWidth: strip.scrollWidth,
          clientWidth: strip.clientWidth,
          visibility: getComputedStyle(strip).visibility,
          headerHeight: header.getBoundingClientRect().height,
          stripVar: parseFloat(getComputedStyle(strip).getPropertyValue("--strip-h")) || 0,
        };
      });
      if (!stripState) {
        failures.push(`${route} @ ${width}x${height}: spec strip or header missing`);
        await stripPage.close();
        continue;
      }
      const label = `${route} @ ${width}x${height}${textZoom !== 100 ? " 200% text" : ""}`;
      if (expectOn) {
        if (!stripState.on) failures.push(`${label}: strip is not pinned after scrolling past the table`);
        if (Math.abs(stripState.height - stripState.stripVar) > 1) failures.push(`${label}: strip height ${Math.round(stripState.height)}px does not match --strip-h ${stripState.stripVar}px`);
        if (stripState.scrollWidth > stripState.clientWidth + 1) {
          if (textZoom === 100) failures.push(`${label}: strip content overflows ${stripState.scrollWidth}px into ${stripState.clientWidth}px`);
          else informational.push(`${label}: strip line overflows ${stripState.scrollWidth}px into ${stripState.clientWidth}px; clipped aria-hidden duplicate at zoom (the table carries the content)`);
        }
        if (Math.abs(stripState.top - stripState.headerHeight) > 2) failures.push(`${label}: strip top ${Math.round(stripState.top)}px does not sit under the ${Math.round(stripState.headerHeight)}px header`);
      } else if (stripState.visibility !== "hidden" || stripState.on) {
        failures.push(`${label}: strip must stay hidden below the 1100px threshold`);
      }
      const overflow = await stripPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) failures.push(`${label}: document overflow ${overflow}px with the spec strip in play`);
      // Retract path: scrolling back so the table re-enters the viewport must
      // take the strip off. Two steps, like the way down: crossing the table
      // guarantees the crossing-driven observer sees the reader's pass-through
      // (an instant jump straight to the top crosses nothing at 200% text,
      // where the table sits below the fold at scroll 0).
      await stripPage.evaluate(() => {
        const table = document.querySelector(".case-spec__table");
        if (table) window.scrollTo({ top: Math.max(0, table.getBoundingClientRect().top + window.scrollY + 120), behavior: "instant" });
      });
      await stripPage.waitForTimeout(80);
      await stripPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await stripPage.waitForFunction(() => !document.querySelector(".case-spec__strip")?.classList.contains("is-on"), null, { timeout: 2000 }).catch(() => {});
      const retracted = await stripPage.evaluate(() => !document.querySelector(".case-spec__strip")?.classList.contains("is-on"));
      if (!retracted) failures.push(`${label}: strip did not retract when the table re-entered the viewport`);
      await stripPage.close();
    }
  }

  // Fragment jumps must clear the pinned chrome with the [6, 20]px gap band:
  // with the strip active at 1100 and up, and with the header alone below the
  // threshold. If the last section clamps at maximum scroll the gap stops
  // signalling a defect, so clamping is detected and recorded instead. Rev 3
  // adds #design-basis (the one target where a reserved-but-off window could
  // appear, audit C5) and a 200%-text pass: at zoom the header is a 138px box,
  // so the settled jump must still land inside the band once the strip is up.
  for (const [width, height, textZoom] of [[390, 844, 100], [1100, 800, 100], [1440, 900, 100], [1100, 800, 200], [1440, 900, 200]]) {
    for (const section of ["#fault-level", "#assumptions-and-limits", "#design-basis"]) {
      if (textZoom !== 100 && section !== "#fault-level") continue;
      const jumpPage = await browser.newPage({ viewport: { width, height } });
      // Rev 4 (audit D3): the 200%-text arrival case loads at the top and jumps
      // like an index-link reader -- a fragment URL would pre-resolve the scroll
      // at default text, and a pre-scroll through the table would manufacture
      // the intersection crossing the product must produce itself.
      const response = await jumpPage.goto(`${base}/projects/lv-cabling-design-commercial-complex${textZoom === 100 ? section : ""}`, { waitUntil: "networkidle" });
      checks += 1;
      const jumpLabel = `case-study jump ${section} @ ${width}x${height}${textZoom !== 100 ? " 200% text" : ""}`;
      if (!response || !response.ok()) {
        failures.push(`${jumpLabel}: HTTP ${response ? response.status() : "no response"}`);
        await jumpPage.close();
        continue;
      }
      await jumpPage.evaluate(() => document.fonts.ready);
      if (textZoom !== 100) {
        await jumpPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
        await jumpPage.evaluate(() => document.fonts.ready);
        await jumpPage.waitForTimeout(250);
        await jumpPage.evaluate((selector) => document.querySelector(selector).scrollIntoView({ behavior: "instant" }), section);
      }
      await settleScroll(jumpPage);
      if (width >= 1100) {
        await jumpPage.waitForFunction(() => document.querySelector(".case-spec__strip")?.classList.contains("is-on"), null, { timeout: 1500 }).catch(() => {});
        const arrived = await jumpPage.evaluate(() => document.querySelector(".case-spec__strip")?.classList.contains("is-on") ?? false);
        if (!arrived) failures.push(`${jumpLabel}: the strip did not arrive after the jump (the crossing-driven observer missed it; Rev 4 rootMargin guard)`);
      }
      const jump = await jumpPage.evaluate((selector) => {
        const target = document.querySelector(selector);
        const header = document.querySelector(".site-header");
        const strip = document.querySelector(".case-spec__strip");
        if (!target || !header || !strip) return null;
        const headerBottom = header.getBoundingClientRect().bottom;
        const stripOn = strip.classList.contains("is-on");
        const stripBottom = strip.getBoundingClientRect().bottom;
        const chromeBottom = stripOn && stripBottom > headerBottom ? stripBottom : headerBottom;
        return {
          gap: target.getBoundingClientRect().top - chromeBottom,
          clamped: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
        };
      }, section);
      if (!jump) failures.push(`${jumpLabel}: target or chrome missing`);
      else if (jump.gap < 6 || jump.gap > 20) {
        if (jump.clamped) informational.push(`${jumpLabel}: clamped at maximum scroll (gap ${Math.round(jump.gap)}px); not a defect`);
        else failures.push(`${jumpLabel}: heading gap is ${Math.round(jump.gap)}px, expected 6-20px`);
      }
      await jumpPage.close();
    }
  }

  // PLAN v7 Rev 3 (audit C5): behaviour 6 (a no-JS jump lands with the wider
  // reservation rather than under any chrome) is asserted, not just accepted.
  // Box geometry comes from the locator API, which works without page JS.
  for (const [width, height, expectedGap] of [[1100, 800, 56], [390, 844, 12]]) {
    const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height } });
    const noJsPage = await noJsContext.newPage();
    const url = `${base}/projects/lv-cabling-design-commercial-complex#fault-level`;
    const response = await noJsPage.goto(url, { waitUntil: "load" });
    checks += 1;
    if (!response || !response.ok()) {
      failures.push(`no-JS jump @ ${width}x${height}: HTTP ${response ? response.status() : "no response"}`);
    } else {
      // The fragment scroll happens during first layout, before webfonts swap
      // in; after the long sweep the first jump can be measured against
      // fallback-font geometry (observed once: gap 18px instead of 56px,
      // 2026-09-17). Settle the network, then re-jump so the measurement uses
      // final metrics. Same-document navigation re-scrolls to the fragment.
      await noJsPage.waitForLoadState("networkidle").catch(() => {});
      await noJsPage.waitForTimeout(300);
      await noJsPage.goto(url, { waitUntil: "load" }).catch(() => {});
      const targetBox = await noJsPage.locator("#fault-level").boundingBox().catch(() => null);
      const headerBox = await noJsPage.locator(".site-header").boundingBox().catch(() => null);
      if (!targetBox || !headerBox) failures.push(`no-JS jump @ ${width}x${height}: box model unavailable`);
      else {
        const gap = Math.round(targetBox.y - (headerBox.y + headerBox.height));
        if (Math.abs(gap - expectedGap) > 2) failures.push(`no-JS jump @ ${width}x${height}: fragment gap is ${gap}px, expected the reserved ${expectedGap}px`);
      }
    }
    await noJsContext.close();
  }

  // PLAN v7 Rev 4 (audit D1): min-height reads the static floor, so the header
  // can shrink again after text grows (a measurement written into min-height
  // ratchets at the last value), and an inline measured value must not defeat
  // the <=720px floor. The floor binds at every step, so these assertions do
  // not depend on the observer's timing.
  {
    const ratchetPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await ratchetPage.goto(`${base}/projects/lv-cabling-design-commercial-complex`, { waitUntil: "networkidle" });
    await ratchetPage.waitForTimeout(600);
    const zooms = [200, 150, 100];
    const expectedHeights = [144, 110, 76];
    for (let index = 0; index < zooms.length; index += 1) {
      await ratchetPage.evaluate((value) => { document.documentElement.style.fontSize = value + "%"; }, zooms[index]);
      await ratchetPage.evaluate(() => document.fonts.ready);
      await ratchetPage.waitForTimeout(700);
      const height = await ratchetPage.evaluate(() => Math.round(document.querySelector(".site-header").getBoundingClientRect().height));
      checks += 1;
      if (Math.abs(height - expectedHeights[index]) > 1) failures.push(`chrome ratchet @ 1440: header is ${height}px at ${zooms[index]}% text, expected the ${expectedHeights[index]}px floor (it must rebind each way)`);
    }
    await ratchetPage.setViewportSize({ width: 390, height: 844 });
    await ratchetPage.waitForTimeout(600);
    const mobileHeight = await ratchetPage.evaluate(() => Math.round(document.querySelector(".site-header").getBoundingClientRect().height));
    if (Math.abs(mobileHeight - 68) > 1) failures.push(`chrome resize @ 1440 -> 390: header is ${mobileHeight}px, expected the 68px floor (an inline measured value must not defeat the <=720px rule)`);
    await ratchetPage.close();
  }

  // The pre-hydration floor at zoom: a deep link resolved with 200% text set
  // before first paint must land clear of the header and of the strip that
  // arrives after hydration.
  {
    const zoomContext = await browser.newContext({ viewport: { width: 1100, height: 800 } });
    await zoomContext.addInitScript(() => {
      const apply = () => {
        if (!document.documentElement) return false;
        document.documentElement.style.fontSize = "200%";
        return true;
      };
      if (!apply()) {
        const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
        observer.observe(document, { childList: true });
      }
    });
    const zoomPage = await zoomContext.newPage();
    const response = await zoomPage.goto(`${base}/projects/lv-cabling-design-commercial-complex#fault-level`, { waitUntil: "networkidle" });
    checks += 1;
    if (!response || !response.ok()) {
      failures.push(`deep link @ 200% text: HTTP ${response ? response.status() : "no response"}`);
    } else {
      await zoomPage.evaluate(() => document.fonts.ready);
      await zoomPage.waitForTimeout(700);
      const deep = await zoomPage.evaluate(() => {
        const target = document.getElementById("fault-level");
        const header = document.querySelector(".site-header");
        const strip = document.querySelector(".case-spec__strip");
        const headerBottom = header.getBoundingClientRect().bottom;
        const stripOn = strip.classList.contains("is-on");
        const stripBottom = strip.getBoundingClientRect().bottom;
        return { gap: Math.round(target.getBoundingClientRect().top - (stripOn && stripBottom > headerBottom ? stripBottom : headerBottom)) };
      });
      if (deep.gap < 6 || deep.gap > 20) failures.push(`deep link @ 200% text: heading gap is ${deep.gap}px, expected 6-20px (pre-hydration floor plus measured header)`);
    }
    await zoomContext.close();
  }

  // Skip-link keyboard journey (site screening audit 2026-09-16, F1): Tab must
  // reach the skip link first, Enter must land focus on the content landmark,
  // and the next Tab must enter content rather than repeat header chrome.
  for (const [width, height] of [[1280, 720], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const route of ["/", "/contact", "/projects/lv-cabling-design-commercial-complex"]) {
      const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      checks += 1;
      if (!response || !response.ok()) {
        failures.push(`${route} @ ${width}x${height}: HTTP ${response ? response.status() : "no response"} (skip-link probe)`);
        continue;
      }
      await page.keyboard.press("Tab");
      const first = await page.evaluate(() => ({
        cls: String(document.activeElement?.className ?? ""),
        tag: document.activeElement?.tagName ?? "",
      }));
      if (!first.cls.includes("skip-link")) {
        failures.push(`${route} @ ${width}x${height}: first Tab lands on ${first.tag}.${first.cls || "?"}, expected the skip link`);
      }
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      const landed = await page.evaluate(() => document.activeElement?.id ?? "");
      if (landed !== "main-content") {
        failures.push(`${route} @ ${width}x${height}: Enter on the skip link must focus #main-content, got ${landed || "none"}`);
      }
      await page.keyboard.press("Tab");
      const next = await page.evaluate(() => {
        const element = document.activeElement;
        return {
          inMain: Boolean(element?.closest("main")),
          inHeader: Boolean(element?.closest(".site-header")),
          tag: element?.tagName ?? "",
        };
      });
      if (!next.inMain || next.inHeader) {
        failures.push(`${route} @ ${width}x${height}: Tab after the skip link must reach content, got ${next.tag}`);
      }
    }
    await page.close();
  }

  // ---- hero reveal probes (re-cut 2026-09-20) ----------------------------
  // 200% root text: rows inside the figure, details fit, panel height stable
  // across every state (the reserved-height promise).
  {
    const enlargedPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await enlargedPage.goto(`${base}/`, { waitUntil: "networkidle" });
    await enlargedPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const states = [];
    const read = () => enlargedPage.evaluate(() => {
      const figure = document.querySelector(".hero-artifact-figure").getBoundingClientRect();
      const panel = document.querySelector(".hero-sld-panel").getBoundingClientRect();
      const rows = [...document.querySelectorAll(".hero-sld-row")].map((el) => el.getBoundingClientRect());
      const visibleDetail = document.querySelector(".hero-sld-detail[data-target]");
      const shown = [...document.querySelectorAll(".hero-sld-detail")].find((el) => getComputedStyle(el).display !== "none");
      const boxes = shown ? [shown.getBoundingClientRect()] : rows;
      const escapes = boxes.filter((r) => !(r.left >= figure.left - 1 && r.right <= figure.right + 1 && r.top >= figure.top - 1 && r.bottom <= figure.bottom + 1));
      const zero = boxes.filter((r) => r.width === 0 || r.height === 0);
      const overlaps = [];
      for (let a = 0; a < rows.length; a += 1) for (let b = a + 1; b < rows.length; b += 1) {
        const A = rows[a], B = rows[b];
        if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom) overlaps.push([a, b]);
      }
      return { panelH: Math.round(panel.height), count: boxes.length, escapes: escapes.length, zero: zero.length, overlaps, visibleDetail: Boolean(visibleDetail) };
    });
    states.push(await read());
    for (const t of ["supply", "mains", "vd", "device", "sup", "hai", "but"]) {
      await enlargedPage.click(`.hero-sld-hit[data-target="${t}"]`);
      states.push(await read());
      await enlargedPage.click(`.hero-sld-hit[data-target="${t}"]`);
    }
    await enlargedPage.close();
    for (const [i, st] of states.entries()) {
      if (st.count === 0 || st.zero > 0) failures.push(`/ with 200% root text: state ${i} rows/detail missing or collapsed (${JSON.stringify(st)})`);
      if (st.escapes > 0) failures.push(`/ with 200% root text: state ${i} content escapes the figure (${JSON.stringify(st)})`);
      if (st.overlaps.length) failures.push(`/ with 200% root text: state ${i} rows overlap (${JSON.stringify(st.overlaps)})`);
    }
    const heights = new Set(states.map((st) => st.panelH));
    if (heights.size !== 1) failures.push(`/ with 200% root text: the panel must keep one height across states (got ${[...heights].join(", ")})`);
  }
  // Reduced motion and print: the default frame, no animations.
  for (const [mode, label] of [["reduce", "reduced"], ["print", "print"]]) {
    const modePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    if (mode === "reduce") await modePage.emulateMedia({ reducedMotion: "reduce" });
    else await modePage.emulateMedia({ media: "print" });
    await modePage.goto(`${base}/`, { waitUntil: "networkidle" });
    const state = await modePage.evaluate(() => {
      const rows = [...document.querySelectorAll(".hero-sld-row")];
      const hits = [...document.querySelectorAll(".hero-sld-hit")];
      const zeroOf = (els) => els.filter((el) => { const r = el.getBoundingClientRect(); return r.width === 0 || r.height === 0; }).length;
      return {
        animations: document.getAnimations().length,
        offsets: [...new Set([...document.querySelectorAll(".hero-sld svg [pathLength]")].map((s) => getComputedStyle(s).strokeDashoffset))],
        rowCount: rows.length,
        rowOpacity: [...new Set(rows.map((r) => getComputedStyle(r).opacity))],
        hitCount: hits.length,
        zeroRows: zeroOf(rows),
        detailsHidden: [...document.querySelectorAll(".hero-sld-detail")].every((el) => getComputedStyle(el).display === "none"),
      };
    });
    await modePage.close();
    if (state.animations !== 0 || state.offsets.join() !== "0px" || state.rowCount !== 7 || state.rowOpacity.join() !== "1" || state.hitCount !== 7 || state.zeroRows !== 0 || !state.detailsHidden) {
      failures.push(`${label} must land the default, drawn frame: ${JSON.stringify(state)}`);
    }
  }
  // No-JS evidence: screenshot plus the contract pins (Playwright cannot
  // evaluate in a JS-disabled page; the reveal copy ships in the HTML).
  {
    const noJsBrowser = await chromium.launch();
    const noJsPage = await noJsBrowser.newPage({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    await noJsPage.goto(`${base}/`, { waitUntil: "load" });
    await noJsPage.waitForTimeout(2500);
    await noJsPage.screenshot({ path: join(SHOT_DIR, "home-nojs-hero.png") });
    await noJsBrowser.close();
    informational.push("no-JS homepage screenshot captured (home-nojs-hero.png)");
  }
  // Mid-ping oracle on its own page: the first row must be mid-fade AND
  // mid-scale at the midpoint of the first ping, and the rows must be clean.
  {
    const pingPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pingPage.goto(`${base}/`, { waitUntil: "load" });
    const ping = await pingPage.evaluate(() => {
      const root = document.querySelector(".hero-sld svg");
      const endMs = parseFloat(getComputedStyle(root).getPropertyValue("--plot-end"));
      document.getAnimations().forEach((a) => { a.pause(); a.currentTime = endMs + 150; });
      const scaleOf = (t) => { const m = t.match(/matrix\(([\d.]+)/); return m ? parseFloat(m[1]) : 1; };
      const first = document.querySelector(".hero-sld-row");
      const boxes = [...document.querySelectorAll(".hero-sld-row")].map((el) => el.getBoundingClientRect());
      const overlaps = [];
      for (let a = 0; a < boxes.length; a += 1) for (let b = a + 1; b < boxes.length; b += 1) {
        const A = boxes[a], B = boxes[b];
        if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom) overlaps.push([a, b]);
      }
      return { rowCount: boxes.length, opacity: parseFloat(getComputedStyle(first).opacity), scale: scaleOf(getComputedStyle(first).transform), overlaps };
    });
    await pingPage.close();
    if (ping.rowCount !== 7 || !(ping.opacity < 1 && ping.scale < 1)) failures.push(`the first reveal row must be mid-fade AND mid-scale at its midpoint: ${JSON.stringify(ping)}`);
    if (ping.overlaps.length) failures.push(`reveal rows must not overlap in the frozen mid-ping frame: ${JSON.stringify(ping.overlaps)}`);
  }

  await browser.close();
  server.close();

  for (const note of informational) console.log(`Layout check info: ${note}`);
  if (failures.length > 0) {
    console.error(`Layout check failures (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Layout checks passed: ${checks} route/viewport combinations${FAST ? " (LAYOUT_FAST: homepage only, two viewports)" : ""}, screenshots in ${SHOT_DIR}/.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
