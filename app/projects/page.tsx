import { sharedOpenGraph } from "@/lib/site";
import type { Metadata } from "next";
import { ProjectJourneyLanes } from "@/components/ProjectJourneyLanes";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering projects moving from theory towards proof, with verified power studies, active embedded and autonomy work, and honest evidence boundaries.",
  openGraph: { ...sharedOpenGraph, type: "website", title: "Projects", description: "Engineering projects moving from theory towards proof, with verified power studies, active embedded and autonomy work, and honest evidence boundaries.", url: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <section className="page-hero projects-hero">
        <h1>Projects</h1>
      </section>
      <ProjectJourneyLanes />
    </main>
    <SiteFooter />
    </>
  );
}
