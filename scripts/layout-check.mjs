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

const ROUTES = [
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
  "/workbench/bench-fume-extractor",
];

const VIEWPORTS = [
  [320, 760],
  [375, 812],
  [390, 844],
  [720, 900],
  [768, 1024],
  [960, 900],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
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
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) {
        failures.push(`${route} @ ${width}x${height}: horizontal overflow ${overflow}px`);
      }
      if (route === "/") {
        const epilogue = page.locator("[data-homepage-epilogue]");
        const portals = page.locator("[data-homepage-portal]");
        if ((await epilogue.count()) !== 1) failures.push(`/ @ ${width}x${height}: homepage epilogue count is not 1`);
        if ((await portals.count()) !== 2) failures.push(`/ @ ${width}x${height}: homepage portal count is not 2`);

        const footerAdjacent = await page.evaluate(() => {
          const ribbon = document.querySelector("[data-homepage-epilogue]");
          return ribbon?.nextElementSibling?.matches(".site-footer") ?? false;
        });
        if (!footerAdjacent) failures.push(`/ @ ${width}x${height}: footer does not immediately follow epilogue`);

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
      }
      const slug = route === "/" ? "home" : route.replaceAll("/", "_").replace(/^_/, "");
      await page.screenshot({ path: join(SHOT_DIR, `${slug}-${width}x${height}.png`), fullPage: false });
    }
    await page.close();
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

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(`${base}/`, { waitUntil: "networkidle" });
  const menuButton = mobilePage.locator(".menu-button");
  await menuButton.click();
  if ((await menuButton.getAttribute("aria-expanded")) !== "true") failures.push(`/ mobile menu: button does not report expanded state`);
  await mobilePage.keyboard.press("Escape");
  if ((await menuButton.getAttribute("aria-expanded")) !== "false") failures.push(`/ mobile menu: Escape does not close navigation`);
  const menuRetainsFocus = await menuButton.evaluate((node) => document.activeElement === node);
  if (!menuRetainsFocus) failures.push(`/ mobile menu: Escape does not return focus to menu button`);
  await mobilePage.close();

  await browser.close();
  server.close();

  if (failures.length > 0) {
    console.error(`Layout check failures (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Layout checks passed: ${checks} route/viewport combinations, screenshots in ${SHOT_DIR}/.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
