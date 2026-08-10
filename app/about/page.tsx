import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolsStandardsNetwork } from "@/components/ToolsStandardsNetwork";

export const metadata: Metadata = {
  title: "About",
  description:
    "Electrical and electronics engineering student in South Australia focused on standards-informed power design, embedded systems, manufacturing experience, and evidence-based engineering.",
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero page-hero--about">
        <p className="eyebrow">About</p>
        <h1>Solar systems, from grid to factory.</h1>
        <p>I became a chef to help people, then chose engineering to pursue net zero and Australia's energy dominance through solar.</p>
      </section>
      <section className="about-story">
        <div className="about-story-intro">
          <div><p className="eyebrow">Approach</p><h2>Start with constraints.</h2></div>
          <p>I start with constraints: define the requirement, expose assumptions, build the smallest useful test, then explain what the result means. Moving from comfortable hospitality work into a degree-adjacent solar-manufacturing role was deliberate; it keeps me closer to engineering practice.</p>
        </div>
        <div className="about-story-grid">
          <article>
            <h3>Study</h3>
            <p>At TAFE SA, I have worked through standards-informed electrical design: cable sizing, protection, grid-connection reasoning, single-line diagrams, wiring schedules, and compliance matrices. My current path leads into Electrical and Electronic Engineering at Adelaide University, expected 2028.</p>
          </article>
          <article>
            <h3>Manufacturing made it practical.</h3>
            <p>At Tindo Solar, production work gives me direct exposure to solar-panel manufacturing, 5S, Kaizen, quality checks, and fault-finding culture. By shadowing their engineers, I learnt how RCA and 8D problem-solving connect engineering decisions with process reliability and operator reality.</p>
          </article>
          <article>
            <h3>Bench and teams</h3>
            <p>Outside work and study, I keep building at the <Link className="text-link" href="/workbench">bench</Link>: small systems where limitations stay visible and useful. When I was a chef and was appointed as kitchen supervisor, I learnt how to coordinate teams, train staff, manage stock, and make calm decisions under pressure.</p>
          </article>
        </div>
      </section>
      <section className="about-tools" id="tools-and-standards" aria-labelledby="tools-and-standards-heading">
        <ToolsStandardsNetwork />
      </section>
      <SiteFooter />
    </main>
  );
}
