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
        <h1>Engineering work,<br />{" "}shown as evidence.</h1>
        <p>Case-study structure is ready. Verified ownership, decisions, outcomes, and evidence status are visible for human review and machine extraction.</p>
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
