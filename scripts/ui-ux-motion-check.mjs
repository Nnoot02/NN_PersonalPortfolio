// Behavioral acceptance for the 2026-10-04 UI/UX and micro-motion change.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve("out");
const shots = "test-results/ui-ux-motion";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const candidates = path === "/" ? [join(root, "index.html")] : [resolve(root, `.${path}`), resolve(root, `.${path}.html`), resolve(root, `.${path}`, "index.html")];
  const file = candidates.find(p => p.startsWith(root + "/") || p.startsWith(root + "\\"));
  const found = candidates.find(p => (p.startsWith(root + "/") || p.startsWith(root + "\\")) && existsSync(p) && extname(p));
  if (!file || !found) { res.writeHead(404).end(); return; }
  try { res.writeHead(200, { "Content-Type": types[extname(found)] ?? "application/octet-stream" }); res.end(await readFile(found)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"] });
// Opt-in causal regression: restoring hidden rows must fail direct comparison.
const legendMutant = process.env.UI_UX_LEGEND_MUTANT === "1";
let checks = 0;
const settle = page => page.waitForFunction(() => document.getAnimations().every(a => a.playState !== "running"), null, { timeout: 10000 });
const focusAt = async (page, selector) => { try { await page.waitForFunction(s => document.activeElement.matches(s), selector, { timeout: 2000 }); } catch (error) { console.error(JSON.stringify({ expected: selector, ...await page.evaluate(() => ({ width: innerWidth, active: document.activeElement.outerHTML.slice(0,400), selected: document.querySelector(".hero-artifact-figure")?.getAttribute("data-active"), rowVisibility: getComputedStyle(document.querySelector(".hero-sld-row")).visibility })) })); await page.screenshot({ path: join(shots, "failure.png"), fullPage: true }); throw error; } };

try {
  for (const reducedMotion of legendMutant ? ["reduce"] : ["no-preference", "reduce"]) {
    for (const width of legendMutant ? [768] : [320, 390, 768, 1440]) {
      console.log(`Checking ${width}px / ${reducedMotion}`);
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      // Hold/reject isolated clipboard requests to exercise every actual state.
      // No OS clipboard writes or permission grants during browser checks.
      await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => new Promise((resolve, reject) => { window.copyRequest = { resolve, reject }; }) },
      }));
      await page.goto(base, { waitUntil: "networkidle" });
      await settle(page);
      if (legendMutant) await page.addStyleTag({ content: ".hero-artifact-figure[data-active] .hero-sld-rows { visibility: hidden !important; }" });
      // Hero room pass 2026-10-18: no hint line; rows are names only and the
      // value stays in each row's accessible name, visually hidden.
      assert.equal(await page.locator(".hero-sld-hint").count(), 0, "retired hint line must not return");
      if (width > 720) {
        assert.ok(await page.locator(".hero-sld-row-value").first().evaluate(e => e.getBoundingClientRect().width) <= 1, "legend values must be visually hidden with JS on");
        assert.equal(await page.getByRole("button", { name: "Supply 500 kVA · 400 V 3-ph", exact: true }).count(), 1, "legend row must keep its value in its accessible name");
      }
      const actions = page.locator(".hero-actions");
      assert.equal(await actions.getByRole("link", { name: "View projects", exact: true }).getAttribute("href"), "/projects");
      if (width === 390) {
        const bottom = await actions.evaluate(e => e.getBoundingClientRect().bottom);
        assert.ok(bottom <= 844, `390px: hero actions below first viewport (${bottom})`);
      }
      // 2026-10-25: the diagram figure is dropped on phones (globals.css,
      // max-width 720px); its legend and detail run only where it shows.
      if (width > 720) {
        const fullSize = page.getByRole("link", { name: "Open the full-size diagram", exact: false });
        assert.equal(await fullSize.getAttribute("href"), "/images/lv-cabling-sld.svg");
        assert.ok((await fullSize.boundingBox()).height >= 44);
        const rows = page.locator(".hero-sld-row");
        assert.equal(await rows.count(), 7);
        for (const row of await rows.all()) {
          const control = await row.getAttribute("aria-controls");
          assert.ok(await page.locator(`[id="${control}"]`).count() === 1, `disclosure target must be unique: ${control}`);
          assert.equal(await row.getAttribute("aria-expanded"), "false");
          assert.equal(await row.getAttribute("aria-pressed"), null, "disclosure must not also announce a toggle state");
          assert.ok((await row.boundingBox()).height >= 44, "legend row misses 44px target");
        }
        const originalHeight = await page.locator(".hero-artifact-figure").evaluate(e => e.getBoundingClientRect().height);
        for (const dismissal of ["Escape", "button", "Escape"]) {
          const row = page.locator('.hero-sld-row[data-target="supply"]');
          await row.focus();
          await page.keyboard.press("Enter");
          await focusAt(page, '.hero-sld-detail[data-target="supply"]');
          assert.equal(await row.getAttribute("aria-expanded"), "true");
          assert.equal(await page.locator(".hero-sld-rows").isVisible(), true, "legend must remain selectable with detail open");
          await page.locator('.hero-sld-row[data-target="vd"]').click();
          assert.equal(await page.locator('.hero-sld-detail[data-target="vd"]').isVisible(), true, "switch directly between details");
          assert.equal(await page.locator('.hero-sld-detail[data-target="supply"]').evaluate(e => getComputedStyle(e).animationName), "none", "unselected detail must stop its reveal");
          assert.equal(await page.locator('.hero-sld-detail[data-target="vd"]').evaluate(e => getComputedStyle(e).animationName), reducedMotion === "reduce" ? "none" : "detail-reveal");
          await row.click();
          const detail = page.locator('.hero-sld-detail[data-target="supply"]');
          assert.equal(await detail.evaluate(e => getComputedStyle(e).animationName), reducedMotion === "reduce" ? "none" : "detail-reveal");
          await settle(page);
          const openHeight = await page.locator(".hero-artifact-figure").evaluate(e => e.getBoundingClientRect().height);
          // compact by default (2026-10-18): stacked, the hero box expands to show
          // the detail; side by side the hero row holds the figure height
          if (width > 960) assert.ok(Math.abs(originalHeight - openHeight) <= 1, `side-by-side detail changed figure height: ${originalHeight} -> ${openHeight}`);
          else assert.ok(openHeight > originalHeight + 20, `stacked detail must expand the hero box: ${originalHeight} -> ${openHeight}`);
          assert.equal(await page.locator('.hero-sld-row[data-target="supply"] .hero-sld-row-disclosure').evaluate(e => getComputedStyle(e).transform), "matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)", "open row's + must turn into a close mark");
          if (dismissal === "Escape") await page.keyboard.press("Escape");
          else {
            const close = page.getByRole("button", { name: "Close the detail", exact: true });
            const box = await close.boundingBox();
            assert.ok(box.width >= 44 && box.height >= 44, "detail close misses 44px target");
            await close.click();
          }
          await focusAt(page, '.hero-sld-row[data-target="supply"]');
          assert.equal(await row.getAttribute("aria-expanded"), "false");
          await settle(page);
          const closedHeight = await page.locator(".hero-artifact-figure").evaluate(e => e.getBoundingClientRect().height);
          assert.ok(Math.abs(originalHeight - closedHeight) <= 1, `closing must return the hero to its compact height: ${originalHeight} -> ${closedHeight}`);
        }
        if (width >= 768) {
          await page.locator('.hero-sld-hit[data-target="mains"]').click();
          await page.getByRole("button", { name: "Close the detail", exact: true }).click();
          await focusAt(page, '.hero-sld-row[data-target="mains"]');
        }
      } else {
        assert.equal(await page.locator(".hero-image").evaluate(e => getComputedStyle(e).display), "none", "hero diagram must be hidden on phones");
      }
      if (width <= 720) {
        const menu = page.getByRole("button", { name: "Open navigation", exact: true });
        await menu.click();
        const nav = page.locator("#primary-navigation");
        await page.waitForFunction(() => document.querySelector('.menu-button').getAttribute('aria-expanded') === 'true');
        assert.equal(await nav.evaluate(e => getComputedStyle(e).animationName), reducedMotion === "reduce" ? "none" : "menu-reveal");
        assert.equal(await nav.getByRole("link", { name: "Projects", exact: true }).isVisible(), true);
        await page.keyboard.press("Escape");
        await focusAt(page, ".menu-button");
      }
      await page.goto(`${base}/contact`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const copy = page.getByRole("button", { name: "Copy address", exact: true });
      const copyWidth = (await copy.boundingBox()).width;
      await copy.click();
      const copying = page.getByRole("button", { name: "Copying email", exact: true });
      await copying.waitFor();
      assert.equal(await copying.isDisabled(), true, "copy request must disable duplicate submissions");
      assert.ok(Math.abs((await copying.boundingBox()).width - copyWidth) <= 1, "copying state changed button width");
      await page.evaluate(() => window.copyRequest.resolve());
      const copied = page.getByRole("button", { name: "Copied email", exact: true });
      await copied.waitFor();
      assert.ok(Math.abs((await copied.boundingBox()).width - copyWidth) <= 1, "copy success changed button width");
      assert.equal(await page.locator('[role="status"]').innerText(), "Email address copied to clipboard.");
      assert.equal(await copied.locator("svg").evaluate(e => getComputedStyle(e).animationName), reducedMotion === "reduce" ? "none" : "state-fade");
      await copy.waitFor();
      await copy.click();
      await page.getByRole("button", { name: "Copying email", exact: true }).waitFor();
      await page.evaluate(() => window.copyRequest.reject(new Error("Simulated clipboard denial")));
      const failed = page.getByRole("button", { name: "Copy failed", exact: true });
      await failed.waitFor();
      assert.ok(Math.abs((await failed.boundingBox()).width - copyWidth) <= 1, "failed state changed button width");
      assert.equal(await page.locator('[role="status"]').innerText(), "Could not copy. Use the address shown next to this button.");
      await page.goto(`${base}/workbench/bench-fume-extractor`, { waitUntil: "networkidle" });
      if (width === 390) assert.ok((await page.locator("h1").boundingBox()).height < 200, "build heading still exceeds compact phone budget");
      const photo = page.locator(".evidence-trigger").first();
      await photo.click();
      const dialog = page.getByRole("dialog", { name: "Evidence photo at full size" });
      await dialog.waitFor();
      assert.equal(await dialog.evaluate(e => getComputedStyle(e, "::backdrop").animationName), reducedMotion === "reduce" ? "none" : "state-fade");
      await page.keyboard.press("Escape");
      await focusAt(page, ".evidence-trigger");
      assert.equal(await dialog.isVisible(), false);
      assert.deepEqual(errors, [], "runtime errors");
      if (width === 390 || width === 1440) {
        await page.goto(base, { waitUntil: "networkidle" });
        await settle(page);
        await page.screenshot({ path: join(shots, `home-${width}-${reducedMotion}.png`), fullPage: true });
      }
      checks++;
      await context.close();
    }
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  for (const [slug, ceiling] of [// LV: 1900 -> 2150 when the one-line diagram took its 720px sideways-pan
  // floor on phones (Nathan's call): the stage is ~220px taller than the
  // shrunk drawing it replaced (measured 1840 -> 2118).
  ["lv-cabling-design-commercial-complex", 2150], ["solar-grid-connection-assessment", 2400], ["gps-denied-autonomous-uav", 2000]]) {
    await page.goto(`${base}/projects/${slug}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".case-meta").count(), 0);
    const headings = await page.locator(".case-sections h2").allTextContents();
    assert.deepEqual(headings, ["What needed solving", "How the work is framed"]);
    const top = await page.locator(".writeup").evaluate(e => e.getBoundingClientRect().top);
    assert.ok(top < ceiling, `${slug}: write-up starts at ${top}, budget ${ceiling}`);
    console.log(`${slug}: phone write-up begins ${Math.round(top)}px (budget ${ceiling})`);
    await page.screenshot({ path: join(shots, `${slug}-390.png`), fullPage: true });
    checks++;
  }
  await page.goto(`${base}/projects`, { waitUntil: "networkidle" });
  const stageHeights = await page.locator(".project-journey-stages").evaluateAll(nodes => nodes.map(node => ({ height: node.getBoundingClientRect().height, complete: node.dataset.complete })));
  assert.ok(stageHeights.slice(0, 2).every(stage => stage.complete === "true" && stage.height < 150), "completed phone journeys must remain compact");
  assert.equal(stageHeights[2].complete, undefined, "UAV retains current/future journey");
  assert.ok((await page.locator("h1").boundingBox()).height <= 180, "Projects intro exceeds phone heading budget");
  await page.screenshot({ path: join(shots, "projects-390.png"), fullPage: true });
  await page.close();
  const noJS = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: "reduce" });
  await noJS.goto(base, { waitUntil: "networkidle" });
  assert.equal(await noJS.getByRole("link", { name: "View projects", exact: true }).isVisible(), true);
  assert.equal(await noJS.locator(".hero-image").evaluate(e => getComputedStyle(e).display), "none", "no-JS phone page must drop the diagram too");
  await noJS.setViewportSize({ width: 768, height: 1024 });
  assert.equal(await noJS.locator(".hero-sld-row").count(), 7);
  // there is no detail without JS, so the names-only rows must show their values
  assert.ok(await noJS.locator(".hero-sld-row-value").first().evaluate(e => e.getBoundingClientRect().width) > 1, "no-JS legend must show its values");
  assert.equal(await noJS.locator(".hero-sld-row-disclosure").first().isVisible(), false, "no-JS page must not promise unavailable disclosure interaction");
  assert.equal(await noJS.locator(".hero-summary").evaluate(e => getComputedStyle(e).opacity), "1");
  await noJS.close();
  console.log(`UI/UX motion checks passed: ${checks} viewport/motion and case-study scenarios, plus Projects/no-JS checks.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
