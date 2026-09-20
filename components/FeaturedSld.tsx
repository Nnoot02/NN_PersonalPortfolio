import { readFileSync } from "node:fs";
import path from "node:path";
import { FeaturedSldInteractive } from "@/components/FeaturedSldInteractive";

// Read the published artifact at build time so the strokes become DOM the CSS
// can animate; the file stays the single source for every other consumer and
// for the plot schedule (--plot-end is parsed back out of it). The hover/click
// targets (data-hit) and the schedule are written into the same file by
// scripts/add-plot-attributes.mjs.
const sld = readFileSync(path.join(process.cwd(), "public/images/lv-cabling-sld.svg"), "utf8");
const plotEndMatch = sld.match(/--plot-end:([0-9.]+ms)/);
if (!plotEndMatch) {
  throw new Error("lv-cabling-sld.svg is missing --plot-end; run scripts/add-plot-attributes.mjs");
}
const plotEnd = plotEndMatch[1];

export function FeaturedSldArtifact() {
  return <FeaturedSldInteractive svg={sld} plotEnd={plotEnd} />;
}
