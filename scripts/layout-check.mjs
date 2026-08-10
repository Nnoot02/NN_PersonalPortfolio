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
  [480, 854],
  [640, 900],
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
      if (route === "/about") {
        const desktopNetwork = page.locator("[data-tools-desktop-network]");
        const mobileProof = page.locator("[data-tools-mobile-proof]");
        const lvNode = page.locator('[data-node-id="lv"]');
        if (width >= 760) {
          if (!(await desktopNetwork.isVisible())) failures.push(`/about @ ${width}x${height}: desktop network is hidden`);
          if (await mobileProof.isVisible()) failures.push(`/about @ ${width}x${height}: mobile proof ledger remains visible on desktop`);
          if ((await lvNode.getAttribute("aria-pressed")) !== "true") failures.push(`/about @ ${width}x${height}: strongest project is not selected by default`);
          if (width === 1440) {
            const gridNode = page.locator('[data-node-id="grid"]');
            await gridNode.click();
            const selectedDetail = await page.locator("[data-tools-detail-rail] h3").textContent();
            if (selectedDetail !== "1 MW grid connection") failures.push(`/about desktop interaction: detail rail did not update after project selection`);
            await lvNode.click();
          }
        } else {
          if (await desktopNetwork.isVisible()) failures.push(`/about @ ${width}x${height}: desktop network remains visible on mobile`);
          if (!(await mobileProof.isVisible())) failures.push(`/about @ ${width}x${height}: mobile proof ledger is hidden`);
          const capabilityCount = await mobileProof.locator(".tools-proof-capability").count();
          if (capabilityCount !== 4) failures.push(`/about @ ${width}x${height}: mobile proof ledger has ${capabilityCount} capabilities, expected 4`);
        }
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
      if (route === "/projects") {
        const expectedSlugs = [
          "lv-cabling-design-commercial-complex",
          "solar-grid-connection-assessment",
          "gps-denied-autonomous-uav",
        ];
        const atlas = page.locator("[data-project-atlas]");
        const portals = page.locator("[data-project-slug]");
        const links = page.locator("[data-project-portal-link]");
        const images = page.locator(".project-portal-image img");
        const portalCount = await portals.count();
        const linkCount = await links.count();
        const imageCount = await images.count();
        if ((await atlas.count()) !== 1) failures.push(`/projects @ ${width}x${height}: atlas count is not 1`);
        if (portalCount !== 3) failures.push(`/projects @ ${width}x${height}: portal count is ${portalCount}, expected 3`);
        if (linkCount !== 3) failures.push(`/projects @ ${width}x${height}: portal link count is ${linkCount}, expected 3`);
        if (imageCount !== 3) failures.push(`/projects @ ${width}x${height}: journey image count is ${imageCount}, expected 3`);

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
        if (portalBoxes.length === 3 && width >= 1024) {
          const [lv, solar, uav] = portalBoxes;
          const desktopStaggered =
            lv.top + 16 < solar.top &&
            Math.abs(solar.top - uav.top) <= 4 &&
            uav.left + 8 < lv.left &&
            lv.left + 8 < solar.left;
          if (!desktopStaggered) {
            failures.push(`/projects @ ${width}x${height}: desktop atlas is not staggered by rendered coordinates (${portalBoxes.map((box) => `${Math.round(box.left)}:${Math.round(box.top)}`).join(",")})`);
          }
        }
        if (portalBoxes.length === 3 && width >= 721 && width <= 960) {
          const [lv, solar, uav] = portalBoxes;
          const intermediateTwoColumn =
            Math.abs(lv.top - solar.top) <= 4 &&
            lv.left + 8 < solar.left &&
            uav.top > Math.max(lv.bottom, solar.bottom) + 12;
          if (!intermediateTwoColumn) {
            failures.push(`/projects @ ${width}x${height}: intermediate atlas is not two rendered columns (${portalBoxes.map((box) => `${Math.round(box.left)}:${Math.round(box.top)}`).join(",")})`);
          }
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
          if (metric.naturalWidth !== 1280 || metric.naturalHeight !== 720) failures.push(`/projects @ ${width}x${height}: portal ${index + 1} source is ${metric.naturalWidth}x${metric.naturalHeight}`);
          const checksRenderedWidth = width === 480 || width === 640 || width >= 1024;
          if (checksRenderedWidth && (metric.width < 320 || metric.width > 640)) failures.push(`/projects @ ${width}x${height}: portal ${index + 1} renders ${Math.round(metric.width)}px wide`);
        }

        if (width <= 720) {
          const tops = await portals.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
          for (let index = 1; index < tops.length; index += 1) {
            if (tops[index] <= tops[index - 1]) failures.push(`/projects @ ${width}x${height}: mobile portal tops are not strictly increasing`);
          }
        }

        for (let index = 0; index < linkCount; index += 1) {
          const link = links.nth(index);
          await link.focus();
          const focus = await link.evaluate((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), width: rect.width, height: rect.height };
          });
          if (focus.outlineStyle === "none" || focus.outlineWidth < 2) failures.push(`/projects @ ${width}x${height}: portal ${index + 1} lacks non-colour focus outline`);
          if (focus.width < 44 || focus.height < 44) failures.push(`/projects @ ${width}x${height}: portal ${index + 1} misses 44px touch target`);
        }

        const lensAnchors = await page.locator("[data-manufacturing-lens] a").count();
        if (lensAnchors !== 0) failures.push(`/projects @ ${width}x${height}: manufacturing lens contains a link`);
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
  const projectsZoomedJourneys = await projectsAccessibilityPage.locator(".project-journey").evaluateAll((nodes) =>
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
  const projectsReducedDuration = await projectsAccessibilityPage.locator(".project-portal-image img").first().evaluate(
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
