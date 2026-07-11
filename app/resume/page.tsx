import type { Metadata } from "next";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "General engineering resume spanning power systems, embedded systems, controls, UAVs, manufacturing, DFMA, and verification. Download as PDF or plain text.",
};

export default function ResumePage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero resume-hero">
        <p className="eyebrow">Resume</p>
        <h1>General engineering<br />{" "}resume.</h1>
        <p>This public resume generalises the strongest current application material across power, embedded systems, controls, UAVs, manufacturing, DFMA, and verification. It omits phone number and street address for public portfolio use.</p>
        <a className="button button-primary" href={profile.resumePath} download>
          Download resume <DownloadSimple size={20} />
        </a>
      </section>
      <section className="profile-summary" aria-labelledby="resume-summary-heading">
        <div>
          <p className="eyebrow">Positioning</p>
          <h2 id="resume-summary-heading">Systems-minded electrical engineer.</h2>
          <p>{profile.summary}</p>
        </div>
        <dl className="profile-facts">
          <div>
            <dt>Status</dt>
            <dd>Associate Degree final year; Bachelor articulation expected 2028</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>South Australia</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>{profile.contactEmail}</dd>
          </div>
          <div>
            <dt>Text copy</dt>
            <dd><a className="text-link" href={profile.resumeTextPath}>Plain-text resume</a></dd>
          </div>
        </dl>
      </section>
      <section className="profile-grid">
        <div>
          <p className="eyebrow">Core skills</p>
          <h2>Evidence-backed capability</h2>
          <ul>
            {profile.strengths.map((strength) => <li key={strength}>{strength}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Resume base</p>
          <h2>Generalised from strongest source</h2>
          <p>
            The SAPN resume was the strongest base because it carries the broadest
            reusable evidence: power-system design, solar manufacturing,
            embedded UAV systems, documentation, and measured coursework details.
            Defence/UAV and hands-on electronics details were then blended from
            the LMA, QuantX, and production-technician material.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
