import { sharedOpenGraph } from "@/lib/site";
import type { Metadata } from "next";
import { ProjectJourneyLanes } from "@/components/ProjectJourneyLanes";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Two coursework power studies to AS/NZS standards, a GPS-denied UAV capstone in simulation and a satellite-for-good competition entry, each with its evidence boundary stated.",
  openGraph: { ...sharedOpenGraph, type: "website", title: "Projects", description: "Two coursework power studies to AS/NZS standards, a GPS-denied UAV capstone in simulation and a satellite-for-good competition entry, each with its evidence boundary stated.", url: "/projects" },
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
