import { readFileSync } from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";

// Read the published artifact at build time so the strokes become DOM the CSS
// can animate; the file stays the single source for every other consumer and
// for the plot schedule (--plot-end is parsed back out of it).
const sld = readFileSync(path.join(process.cwd(), "public/images/lv-cabling-sld.svg"), "utf8");
const plotEndMatch = sld.match(/--plot-end:([0-9.]+ms)/);
if (!plotEndMatch) {
  throw new Error("lv-cabling-sld.svg is missing --plot-end; run scripts/add-plot-attributes.mjs");
}
const plotEnd = plotEndMatch[1];

// The four callouts print values the drawing already carries: the supply, the
// mains, the voltage drop and the switchboard device. Anchors are the
// features' viewBox coordinates as percentages of 1200x800; `side` picks the
// leader direction (C runs down because B and C share a band).
const CALLOUTS = [
  { x: "19.7%", y: "14.0%", side: "right", label: "500 kVA · 400 V 3-ph" },
  { x: "19.7%", y: "34.8%", side: "right", label: "25 mm² X-90 Cu · Ib 123.6 A" },
  { x: "39.2%", y: "36.1%", side: "down", label: "ΔV 0.74 % vs 1 % limit" },
  { x: "19.7%", y: "41.6%", side: "right", label: "125 A Type C · PFC 8.0 kA" },
] as const;

export function FeaturedSld() {
  return (
    <div className="hero-sld" style={{ "--plot-end": plotEnd } as CSSProperties}>
      <div className="hero-sld-stage">
        <div className="hero-sld-svg" dangerouslySetInnerHTML={{ __html: sld }} />
        <span className="hero-artifact-callouts" aria-hidden="true">
          {CALLOUTS.map((c, i) => (
            <span
              className="hero-artifact-callout"
              key={c.label}
              data-side={c.side}
              style={{ "--x": c.x, "--y": c.y, "--ping-i": i } as CSSProperties}
            >
              <b className="hero-artifact-dot" />
              <i className="hero-artifact-leader" />
              <span className="hero-artifact-callout-label">{c.label}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

export function FeaturedSldKey() {
  // --plot-end lives on .hero-sld, a sibling of this list, so it cannot be
  // inherited; carry the parsed value onto the key itself.
  return (
    <ul className="hero-sld-key" aria-hidden="true" style={{ "--plot-end": plotEnd } as CSSProperties}>
      {CALLOUTS.map((c, i) => (
        <li key={c.label} style={{ "--ping-i": i } as CSSProperties}>
          <b className="hero-sld-key-dot" />
          {c.label}
        </li>
      ))}
    </ul>
  );
}
