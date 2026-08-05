import type { Metadata } from "next";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Electrical engineering student resume focused on solar power systems, grid integration, standards-based power design, and Australian solar manufacturing experience.",
};

export default function ResumePage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero resume-hero">
        <p className="eyebrow">Resume</p>
        <h1>Solar power<br />{" "}student resume.</h1>
        <p>This public resume leads with solar power systems, grid integration, standards-based power design, and Australian solar manufacturing experience. Phone number and street address are left off the public copy.</p>
        <a className="button button-primary" href={profile.resumePath} download>
          Download resume <DownloadSimple size={20} />
        </a>
      </section>
      <section className="profile-summary" aria-labelledby="resume-summary-heading">
        <div>
          <p className="eyebrow">Positioning</p>
          <h2 id="resume-summary-heading">Electrical engineering student.</h2>
          <p>{profile.summary}</p>
        </div>
        <dl className="profile-facts">
          <div>
            <dt>Status</dt>
            <dd>Electrical engineering student seeking student and internship opportunities</dd>
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
          <h2>Solar-first capability</h2>
          <ul>
            {profile.strengths.map((strength) => <li key={strength}>{strength}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Resume base</p>
          <h2>Built from verified evidence</h2>
          <p>
            This public version leads with verified power-system design and
            solar manufacturing experience. Broader embedded, UAV, and hands-on
            electronics work sits behind it as supporting context.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
