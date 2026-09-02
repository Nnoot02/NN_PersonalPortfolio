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

        // .hero-role is --accent, which measures 4.12:1 on paper: AA only at
        // large-text size (24px at weight 600). DESIGN.md forbids the accent
        // below that size, so pin the computed size at every viewport.
        const heroRoleSize = await page.locator(".hero-role").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
        if (heroRoleSize < 24) failures.push(`/ @ ${width}x${height}: .hero-role is ${heroRoleSize}px, below the 24px large-text floor its accent colour needs`);
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

  await browser.close();
  server.close();

  for (const note of informational) console.log(`Layout check info: ${note}`);
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
