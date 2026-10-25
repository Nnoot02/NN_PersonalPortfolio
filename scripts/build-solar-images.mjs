// Regenerates the three solar grid-connection rasters from the vector source,
// public/images/solar-grid-connection.svg (1536x1024 viewBox):
//
//   public/images/solar-grid-connection.webp                        1536x1024  case-study hero (1536w candidate)
//   public/images/thumbs/solar-grid-connection-800.webp              800x533   hero 800w candidate
//   public/images/project-index/solar-grid-connection-artifact.webp 1280x720   /projects thumbnail
//
// The hero and the 800w thumb show the whole drawing. The index thumb is a crop
// of the vector render on the #e8e3d9 paper-deep canvas: the network-study note,
// the LV branch, the step-up transformer, the point of common coupling and the
// inverter, cut between the inverter and the PV array so no label or box is
// clipped (only connecting lines run off the edge).
//
// Same approach as scripts/build-lv-index-thumb.mjs: Chromium renders the SVG
// and Chromium encodes the WebP, so no image dependency is needed. Not wired
// into `pnpm verify`; run it by hand after the SVG changes, then update the
// pinned hashes in scripts/portfolio-contract.mjs.
//
// Fonts: the SVG names Inter; render on a machine that has it installed.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SVG = path("../public/images/solar-grid-connection.svg");
const W = 1536;
const H = 1024;
// Index crop window in SVG user units; width / height keeps 16:9 so it scales
// to exactly 1280x720.
const INDEX_CROP = { x: 80, y: 205, width: 1120, height: (1120 * 720) / 1280 };

const TARGETS = [
  { out: "../public/images/solar-grid-connection.webp", clip: { x: 0, y: 0, width: W, height: H }, size: [1536, 1024], quality: 0.9 },
  { out: "../public/images/thumbs/solar-grid-connection-800.webp", clip: { x: 0, y: 0, width: W, height: H }, size: [800, 533], quality: 0.88 },
  { out: "../public/images/project-index/solar-grid-connection-artifact.webp", clip: INDEX_CROP, size: [1280, 720], quality: 0.88 },
];

const svg = readFileSync(SVG, "utf8");
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  for (const { out, clip, size, quality } of TARGETS) {
    const scale = size[0] / clip.width;
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
    await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#e8e3d9"><div style="width:${W}px;height:${H}px">${svg}</div>`);
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ clip, type: "png" });
    // Chromium encodes WebP itself, so no image dependency is needed.
    const dataUrl = await page.evaluate(async ({ b64, w, h, q }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL("image/webp", q);
    }, { b64: png.toString("base64"), w: size[0], h: size[1], q: quality });
    writeFileSync(path(out), Buffer.from(dataUrl.split(",")[1], "base64"));
    await page.close();
  }
} finally {
  await browser.close();
}
