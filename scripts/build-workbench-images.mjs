// Rebuild list thumbnails and uncropped landscape share cards from owned photos.
// Run manually; verify never rewrites tracked media.
import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const source = await readFile(new URL("../lib/workbench.ts", import.meta.url), "utf8");
const entries = [...source.matchAll(/    slug: "([^"]+)",[\s\S]*?\n    image: "([^"]+)",/g)];
if (entries.length !== 4) throw new Error("Review image generation inputs when the Workbench set changes.");
for (const directory of ["thumbs", "share"]) {
  await mkdir(new URL(`../public/images/${directory}/`, import.meta.url), { recursive: true });
}
for (const [, slug, image] of entries) {
  const input = fileURLToPath(new URL(`../public${image}`, import.meta.url));
  for (const width of [600, 1200]) {
    // Preserve the photo ratio: desktop and phone slots crop differently in CSS.
    await sharp(input).rotate().resize(width)
      .webp({ quality: 72 }).toFile(fileURLToPath(new URL(`../public/images/thumbs/workbench-${slug}-${width}.webp`, import.meta.url)));
  }
  await sharp(input).rotate().resize(1200, 630, { fit: "contain", background: "#e8e3d9" })
    .webp({ quality: 82 }).toFile(fileURLToPath(new URL(`../public/images/share/workbench-${slug}.webp`, import.meta.url)));
  console.log(`Generated thumbnails and 1200x630 share card: ${slug}`);
}
