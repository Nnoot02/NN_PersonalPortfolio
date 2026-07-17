import type { Metadata } from "next";
import { ProjectRow } from "@/components/ProjectRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering case studies shown as evidence — verified ownership, decisions, outcomes, and honest evidence status for each project.",
};

export default function ProjectsPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero">
        <p className="eyebrow">Project index</p>
        <h1>Solar and grid<br />{" "}work as evidence.</h1>
      </section>
      <section className="featured compact">
        <div className="project-list">
          {projects.map((project) => <ProjectRow project={project} key={project.slug} headingLevel="h2" />)}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
