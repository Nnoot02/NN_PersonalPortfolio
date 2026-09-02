// Renders app/icon2.svg to the two raster icons Next's file convention needs:
// app/icon1.png (32x32, browsers without SVG favicon support) and
// app/apple-icon.png (180x180). Run: pnpm build:icons. Not part of verify:
// verify must not rewrite tracked binaries.
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const svg = await readFile(new URL("../app/icon2.svg", import.meta.url), "utf8");
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const targets = [
  ["../app/icon1.png", 32],
  ["../app/apple-icon.png", 180],
];

const browser = await chromium.launch();
for (const [path, size] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0"><img src="${dataUrl}" width="${size}" height="${size}" style="display:block"></body>`);
  await page.locator("img").evaluate((img) => img.decode());
  await writeFile(new URL(path, import.meta.url), await page.screenshot({ type: "png", omitBackground: false }));
  await page.close();
}
await browser.close();
console.log("icons written: app/icon1.png (32), app/apple-icon.png (180)");
