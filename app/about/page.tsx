import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "Electrical and electronics engineering student in South Australia — standards-informed power design, embedded systems, manufacturing exposure, and evidence-based engineering.",
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero">
        <p className="eyebrow">About</p>
        <h1>Engineering across<br />{" "}the whole system.</h1>
        <p>I am an electrical and electronics engineering student in South Australia, building toward graduate work across power systems, embedded systems, controls, manufacturing, and verification.</p>
      </section>
      <section className="content-grid">
        <div><p className="eyebrow">Approach</p><h2>Start with constraints.</h2></div>
        <div className="prose">
          <p>I prefer evidence-producing work: define the requirement, expose assumptions, build the smallest useful test, then communicate what the result means. That habit comes from combining study, manufacturing work, hospitality leadership, and personal projects rather than treating engineering as only coursework.</p>
          <p>At TAFE SA I have worked through standards-informed electrical design, including cable sizing, protection, grid-connection reasoning, single-line diagrams, wiring schedules, and compliance matrices. My current path articulates into Electrical and Electronic Engineering at Adelaide University, expected 2028.</p>
        </div>
      </section>
      <section className="profile-grid">
        <div>
          <p className="eyebrow">Work evidence</p>
          <h2>Manufacturing made it practical.</h2>
          <ul>
            <li>Production work at Tindo Solar gives me direct exposure to solar-panel manufacturing, 5S, Kaizen, quality checks, and fault-finding culture.</li>
            <li>Shadowing RCA and 8D problem-solving helped connect engineering decisions to process reliability and operator reality.</li>
            <li>Prior kitchen supervision built team coordination, training, stock control, and calm decision-making under pressure.</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Technical direction</p>
          <h2>Power path and defence path share evidence.</h2>
          <ul>
            <li>Power evidence: AS/NZS 3000, AS/NZS 3008, AS/NZS 4777.2, SAPN TS132/TS133, solar manufacturing, and distribution-focused coursework.</li>
            <li>Defence and systems evidence: GPS-denied UAV planning, ROS 2, ArduPilot SITL, MAVLink telemetry, embedded electronics, controls, and DFMA.</li>
            <li>Public portfolio evidence is kept sanitized so useful engineering claims are visible without exposing restricted detail.</li>
          </ul>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
