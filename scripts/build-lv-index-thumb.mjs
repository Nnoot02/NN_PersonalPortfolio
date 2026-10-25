// Regenerates public/images/project-index/lv-cabling-artifact.webp, the
// /projects index thumbnail for the LV case study.
//
// The thumbnail is a crop of the real one-line diagram (lv-cabling-sld.svg),
// rendered from the vector at 1.5x so it stays crisp: the transformer, consumer
// mains, main switchboard and the boards' feeders, which is the part of the
// drawing that is still legible at index size. Output is exactly 1280x720.
//
// Not wired into `pnpm verify`; run it by hand after the SVG changes, then
// update the pinned hashes in scripts/portfolio-contract.mjs.
//
// The crop window below is in SVG user units (1200x800 viewBox): 853.33x480 at
// 1.5x is 1280x720.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const SVG = fileURLToPath(new URL("../public/images/lv-cabling-sld.svg", import.meta.url));
const OUTPUT = fileURLToPath(new URL("../public/images/project-index/lv-cabling-artifact.webp", import.meta.url));
const CROP = { x: 100, y: 58, width: 1280 / 1.5, height: 480 };

const svg = readFileSync(SVG, "utf8");
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1.5 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#e8e3d9"><div id="s" style="width:1200px;height:800px">${svg}</div>`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ clip: CROP, type: "png" });
  // Chromium encodes WebP itself, so no image dependency is needed.
  const dataUrl = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/webp", 0.88);
  }, png.toString("base64"));
  writeFileSync(OUTPUT, Buffer.from(dataUrl.split(",")[1], "base64"));
} finally {
  await browser.close();
}
