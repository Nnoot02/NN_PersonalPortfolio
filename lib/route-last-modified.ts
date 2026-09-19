import "server-only";

import { execFileSync } from "node:child_process";
import routeSources from "./sitemap-route-sources.json";

// Build-time only. The sitemap needs a real per-route modification date, and
// git is the only honest source of one here: this repo already requires git for
// its gates (scripts/repo-hygiene.mjs reads the index), so a build without it
// was never a supported world. The behaviour this replaced -- `new Date()` per
// request -- gave every URL the same build timestamp, which search engines
// discard and which hides content changes completely.
//
// The manifest is a hand-kept map, so it can go stale (add a component to a
// case study and forget the list and that route's date freezes). Two gates
// bound that: scripts/sitemap-route-sources.test.mjs checks the manifest
// against the disk and the published route set, and the contract recomputes
// every URL's date from the same manifest, so a wrong manifest is a gate
// failure rather than a silent one.
//
// Server-only: shelling out to git must never reach the client bundle.
// Next aliases the `server-only` specifier in its compiler
// (next/dist/build/create-compiler-aliases.js), so no dependency is needed.

const cache = new Map<string, Date>();

const sources = routeSources as Record<string, string[]>;

export function routeLastModified(route: string): Date {
  const cached = cache.get(route);
  if (cached) return cached;

  const files = sources[route];
  if (!files || files.length === 0) {
    throw new Error(
      `No content files declared for sitemap route "${route}". Add it to lib/sitemap-route-sources.json.`,
    );
  }

  // `git log` exits 0 with empty output when none of the paths exists in
  // history, so the empty string -- not the exit code -- is the failure signal.
  const committedAt = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...files], {
    encoding: "utf8",
  }).trim();
  if (!committedAt) {
    throw new Error(
      `No git history for sitemap route "${route}" (${files.join(", ")}). Commit the page content before building.`,
    );
  }

  const date = new Date(committedAt);
  cache.set(route, date);
  return date;
}
