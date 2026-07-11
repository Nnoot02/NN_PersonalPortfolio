import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/projects", "/profile", "/about", "/resume", "/contact"];
  const projectRoutes = projects.map((project) => `/projects/${project.slug}`);

  return [...staticRoutes, ...projectRoutes].map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
  }));
}
