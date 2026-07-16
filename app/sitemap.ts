import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import { workbenchEntries } from "@/lib/workbench";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/projects", "/workbench", "/profile", "/about", "/resume", "/contact"];
  const projectRoutes = projects.map((project) => `/projects/${project.slug}`);
  const workbenchRoutes = workbenchEntries.map((entry) => `/workbench/${entry.slug}`);

  return [...staticRoutes, ...projectRoutes, ...workbenchRoutes].map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
  }));
}
