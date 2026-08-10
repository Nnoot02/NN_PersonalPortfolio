import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

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
      <section className="content-grid about-tools" id="tools-and-standards" aria-labelledby="tools-and-standards-heading">
        <div>
          <h2 id="tools-and-standards-heading">Tools and standards</h2>
        </div>
        <dl className="capability-list" data-capability-list>
          <div>
            <dt>Standards</dt>
            <dd>AS/NZS 3000, AS/NZS 3008.1.1, AS/NZS 4777.1 and 4777.2, AS/NZS 5033, SA Power Networks TS132/TS133/TS134, AS1100 technical drawing.</dd>
          </div>
          <div>
            <dt>Power design</dt>
            <dd>Maximum demand, cable selection and de-rating, voltage drop, prospective fault current, earth-fault-loop impedance, single-line diagrams, wiring schedules.</dd>
          </div>
          <div>
            <dt>CAD and EDA</dt>
            <dd>AutoCAD, Autodesk Inventor, Fusion 360, KiCad.</dd>
          </div>
          <div>
            <dt>Instrumentation and simulation</dt>
            <dd>Multimeter, oscilloscope, function generator, LTspice, Logisim.</dd>
          </div>
          <div>
            <dt>Programming and embedded</dt>
            <dd>Python, MATLAB, C, ROS 2, ESP and AVR microcontrollers, MAVLink telemetry.</dd>
          </div>
          <div>
            <dt>Manufacturing and quality</dt>
            <dd>5S, Kaizen, root cause analysis, 8D problem-solving, inspection and soldering.</dd>
          </div>
        </dl>
      </section>
      <SiteFooter />
    </main>
  );
}
