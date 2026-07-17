import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "Electrical and electronics engineering student in South Australia focused on standards-informed power design, embedded systems, manufacturing exposure, and evidence-based engineering.",
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero page-hero--about">
        <p className="eyebrow">About</p>
        <h1>Solar systems,<br />{" "}from grid to factory.</h1>
        <p>I am an electrical engineering student in Adelaide focused on solar power systems and grid integration. My work is grounded in standards-based design and Australian solar manufacturing experience.</p>
      </section>
      <section className="content-grid">
        <div><p className="eyebrow">Approach</p><h2>Start with constraints.</h2></div>
        <div className="prose">
          <p>I start with constraints: define the requirement, expose assumptions, build the smallest useful test, then explain what the result means. Moving from comfortable hospitality work into a degree-adjacent solar-manufacturing role was deliberate; it keeps me closer to engineering practice.</p>
          <p>Outside work and study, I keep building at the <Link className="text-link" href="/workbench">bench</Link>: small systems where limitations stay visible and useful.</p>
          <p>At TAFE SA, I have worked through standards-informed electrical design: cable sizing, protection, grid-connection reasoning, single-line diagrams, wiring schedules, and compliance matrices. My current path leads into Electrical and Electronic Engineering at Adelaide University, expected 2028.</p>
        </div>
      </section>
      <section className="profile-grid profile-grid--about">
        <div>
          <p className="eyebrow">Work evidence</p>
          <h2>Manufacturing made it practical.</h2>
          <ul>
            <li>At Tindo Solar, production work gives me direct exposure to solar-panel manufacturing, 5S, Kaizen, quality checks, and fault-finding culture.</li>
            <li>Shadowing RCA and 8D problem-solving has connected engineering decisions with process reliability and operator reality.</li>
            <li>Kitchen supervision taught me team coordination, training, stock control, and calm decisions under pressure.</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Technical direction</p>
          <h2>Solar and grid integration first.</h2>
          <ul>
            <li>Power evidence: AS/NZS 3000, AS/NZS 3008, AS/NZS 4777.2, SAPN TS132/TS133, solar manufacturing, and distribution-focused coursework.</li>
            <li>Broader systems work: GPS-denied UAV planning, embedded electronics, controls, and DFMA.</li>
            <li>I keep public portfolio evidence sanitised: useful engineering claims stay visible without exposing restricted detail.</li>
          </ul>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
