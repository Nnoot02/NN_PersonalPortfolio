import type { Metadata } from "next";
import { ProjectAtlas } from "@/components/ProjectAtlas";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering projects moving from theory towards proof, with verified power studies, active embedded and autonomy work, and honest evidence boundaries.",
};

export default function ProjectsPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero projects-hero">
        <p className="eyebrow">Power · verification</p>
        <h1>I learn by taking systems from theory towards proof.</h1>
        <p>
          Completed power studies sit beside active embedded and autonomy work.
          Each project shows what I decided, what I produced, and where the evidence currently stops.
        </p>
      </section>
      <ProjectAtlas />
      <SiteFooter />
    </main>
  );
}
