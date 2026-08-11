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
        if (width > 720) {
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
        if (headingStyle.borderTop !== "1px" || headingStyle.borderBottom !== "1px" || headingStyle.radius !== "0px" || headingStyle.shadow !== "none") {
          failures.push("/contact @ " + width + "x" + height + ": snapshot heading rules/furniture are incorrect");
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
        if (width >= 721 && layoutMetrics.contactRect && layoutMetrics.snapshotRect && layoutMetrics.snapshotRect.left <= layoutMetrics.contactRect.left) {
          failures.push("/contact @ " + width + "x" + height + ": snapshot is not to right of contact column");
        }
        if (width <= 720 && layoutMetrics.contactRect && layoutMetrics.actionRect && layoutMetrics.snapshotRect && layoutMetrics.footerRect) {
          if (!(layoutMetrics.contactRect.top < layoutMetrics.actionRect.top && layoutMetrics.actionRect.top < layoutMetrics.snapshotRect.top && layoutMetrics.snapshotRect.top < layoutMetrics.footerRect.top)) {
            failures.push("/contact @ " + width + "x" + height + ": mobile reading order is incorrect");
          }
        }
        if (await compactFooter.count() !== 1) failures.push("/contact @ " + width + "x" + height + ": compact footer marker is missing");
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

  const contactAccessibilityPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await contactAccessibilityPage.goto(base + "/contact", { waitUntil: "networkidle" });
  await contactAccessibilityPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const contactEnlargedOverflow = await contactAccessibilityPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (contactEnlargedOverflow > 1) failures.push("/contact @ 390x844 with 200% root text: horizontal overflow " + contactEnlargedOverflow + "px");
  const contactZoomedHeading = await contactAccessibilityPage.locator(".contact-hero h1").evaluate((node) => {
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
    return { splitWords, clipped: node.scrollWidth > node.clientWidth + 1 };
  });
  if (contactZoomedHeading.splitWords.length > 0 || contactZoomedHeading.clipped) {
    failures.push("/contact @ 390x844 with 200% root text: H1 is unreadable (split words " + (contactZoomedHeading.splitWords.join(",") || "none") + ", clipped " + contactZoomedHeading.clipped + ")");
  }
  await contactAccessibilityPage.screenshot({ path: join(SHOT_DIR, "contact-390x844-text-200.png"), fullPage: true });
  await contactAccessibilityPage.close();

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
