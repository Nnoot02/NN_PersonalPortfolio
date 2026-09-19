import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { routeLastModified } from "@/lib/route-last-modified";
import { absoluteUrl } from "@/lib/site";
import { workbenchEntries } from "@/lib/workbench";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/projects", "/workbench", "/profile", "/about", "/resume", "/contact"];
  const projectRoutes = projects.map((project) => `/projects/${project.slug}`);
  const workbenchRoutes = workbenchEntries.map((entry) => `/workbench/${entry.slug}`);

  return [...staticRoutes, ...projectRoutes, ...workbenchRoutes].map((route) => ({
    url: absoluteUrl(route || "/"),
    // Real per-route dates from git, not one build timestamp for the whole
    // sitemap. The manifest behind them is itself gated
    // (scripts/sitemap-route-sources.test.mjs) and the contract recomputes
    // every date from the same source.
    lastModified: routeLastModified(route || "/"),
  }));
}
