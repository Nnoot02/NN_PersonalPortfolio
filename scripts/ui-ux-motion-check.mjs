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
let checks = 0;
const settle = page => page.waitForFunction(() => document.getAnimations().every(a => a.playState !== "running"), null, { timeout: 10000 });
const focusAt = async (page, selector) => { try { await page.waitForFunction(s => document.activeElement.matches(s), selector, { timeout: 2000 }); } catch (error) { console.error(JSON.stringify({ expected: selector, ...await page.evaluate(() => ({ width: innerWidth, active: document.activeElement.outerHTML.slice(0,400), selected: document.querySelector(".hero-artifact-figure")?.getAttribute("data-active"), rowVisibility: getComputedStyle(document.querySelector(".hero-sld-row")).visibility })) })); await page.screenshot({ path: join(shots, "failure.png"), fullPage: true }); throw error; } };

try {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    for (const width of [320, 390, 768, 1440]) {
      console.log(`Checking ${width}px / ${reducedMotion}`);
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(base, { waitUntil: "networkidle" });
      await settle(page);
      const actions = page.locator(".hero-actions");
      assert.equal(await actions.getByRole("link", { name: "View projects", exact: true }).getAttribute("href"), "/projects");
      if (width === 390) {
        const bottom = await actions.evaluate(e => e.getBoundingClientRect().bottom);
        assert.ok(bottom <= 844, `390px: hero actions below first viewport (${bottom})`);
      }
      const rows = page.locator(".hero-sld-row");
      assert.equal(await rows.count(), 7);
      for (const row of await rows.all()) {
        const control = await row.getAttribute("aria-controls");
        assert.ok(await page.locator(`[id="${control}"]`).count() === 1, `disclosure target must be unique: ${control}`);
        assert.equal(await row.getAttribute("aria-expanded"), "false");
        if (width <= 720) assert.ok((await row.boundingBox()).height >= 44, "phone legend row misses 44px target");
      }
      const originalHeight = await page.locator(".hero-artifact-figure").evaluate(e => e.getBoundingClientRect().height);
      for (const dismissal of ["Escape", "button", "Escape"]) {
        const row = page.locator('.hero-sld-row[data-target="supply"]');
        await row.focus();
        await page.keyboard.press("Enter");
        await focusAt(page, '.hero-sld-detail[data-target="supply"]');
        assert.equal(await row.getAttribute("aria-expanded"), "true");
        const detail = page.locator('.hero-sld-detail[data-target="supply"]');
        assert.equal(await detail.evaluate(e => getComputedStyle(e).animationName), reducedMotion === "reduce" ? "none" : "detail-reveal");
        await settle(page);
        const openHeight = await page.locator(".hero-artifact-figure").evaluate(e => e.getBoundingClientRect().height);
        assert.ok(Math.abs(originalHeight - openHeight) <= 1, `detail changed figure height: ${originalHeight} -> ${openHeight}`);
        if (dismissal === "Escape") await page.keyboard.press("Escape");
        else await page.getByRole("button", { name: "Close the detail", exact: true }).click();
        await focusAt(page, '.hero-sld-row[data-target="supply"]');
        assert.equal(await row.getAttribute("aria-expanded"), "false");
      }
      if (width === 1440) {
        await page.locator('.hero-sld-hit[data-target="mains"]').click();
        await page.getByRole("button", { name: "Close the detail", exact: true }).click();
        await focusAt(page, '.hero-sld-row[data-target="mains"]');
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
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
      const copy = page.getByRole("button", { name: "Copy address", exact: true });
      const copyWidth = (await copy.boundingBox()).width;
      await copy.click();
      const copied = page.getByRole("button", { name: "Copied email", exact: true });
      await copied.waitFor();
      assert.ok(Math.abs((await copied.boundingBox()).width - copyWidth) <= 1, "copy success changed button width");
      assert.equal(await page.locator('[role="status"]').innerText(), "Email address copied to clipboard.");
      assert.equal(await copied.locator("svg").evaluate(e => getComputedStyle(e).animationName), reducedMotion === "reduce" ? "none" : "state-fade");
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
  for (const [slug, ceiling] of [["lv-cabling-design-commercial-complex", 2800], ["solar-grid-connection-assessment", 3600], ["gps-denied-autonomous-uav", 2700]]) {
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
  assert.ok((await page.locator("h1").boundingBox()).height <= 180, "Projects intro exceeds phone heading budget");
  await page.screenshot({ path: join(shots, "projects-390.png"), fullPage: true });
  await page.close();
  const noJS = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: "reduce" });
  await noJS.goto(base, { waitUntil: "networkidle" });
  assert.equal(await noJS.getByRole("link", { name: "View projects", exact: true }).isVisible(), true);
  assert.equal(await noJS.locator(".hero-sld-row").count(), 7);
  assert.equal(await noJS.locator(".hero-sld-hint").isVisible(), false, "no-JS page must not promise unavailable disclosure interaction");
  assert.equal(await noJS.locator(".hero-summary").evaluate(e => getComputedStyle(e).opacity), "1");
  await noJS.close();
  console.log(`UI/UX motion checks passed: ${checks} viewport/motion and case-study scenarios, plus Projects/no-JS checks.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
