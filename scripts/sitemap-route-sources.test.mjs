import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// The sitemap's lastmod dates come from lib/sitemap-route-sources.json. That
// manifest is hand-kept, so it is the one thing in the chain a throw cannot
// protect: a route whose list has gone stale keeps producing a valid-looking
// date. These checks bound it to the disk and to the route set that ships.

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const sources = JSON.parse(readFileSync(join(repoRoot, "lib", "sitemap-route-sources.json"), "utf8"));

const staticRoutes = ["/", "/projects", "/workbench", "/profile", "/about", "/resume", "/contact"];

function slugsFrom(sourceFile) {
  const text = readFileSync(join(repoRoot, sourceFile), "utf8");
  return [...text.matchAll(/^\s*slug: "([^"]+)",/gm)].map((match) => match[1]);
}

function pageFileFor(route) {
  if (route === "/") return "app/page.tsx";
  if (route.startsWith("/projects/")) return "app/projects/[slug]/page.tsx";
  if (route.startsWith("/workbench/")) return "app/workbench/[slug]/page.tsx";
  return `app${route}/page.tsx`;
}

test("the manifest covers exactly the routes the sitemap publishes", () => {
  const expected = [
    ...staticRoutes,
    ...slugsFrom("lib/projects.ts").map((slug) => `/projects/${slug}`),
    ...slugsFrom("lib/workbench.ts").map((slug) => `/workbench/${slug}`),
  ].sort();
  assert.deepEqual(Object.keys(sources).sort(), expected);
});

test("every route lists files that exist and names its own page file", () => {
  for (const [route, files] of Object.entries(sources)) {
    assert.ok(Array.isArray(files) && files.length > 0, `${route} must list content files`);
    for (const file of files) {
      assert.ok(existsSync(join(repoRoot, file)), `${route} lists ${file}, which does not exist`);
    }
    assert.ok(files.includes(pageFileFor(route)), `${route} must list its own page file (${pageFileFor(route)})`);
  }
});
