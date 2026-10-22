import Link from "next/link";
import { sharedOpenGraph } from "@/lib/site";
import type { Metadata } from "next";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "Electrical engineering student résumé focused on solar power systems, grid integration, standards-based power design, and Australian solar manufacturing experience.",
  openGraph: { ...sharedOpenGraph, type: "website", title: "Résumé", description: "Electrical engineering student résumé focused on solar power systems, grid integration, standards-based power design, and Australian solar manufacturing experience.", url: "/resume" },
};

// Audit 2026-09-24, S1 (Nathan's call, option a): /profile is the fact sheet,
// so this page is the download plus what the PDF covers. The positioning
// paragraph and strengths list it used to repeat live on /profile only.
const pdfContents = [
  "Summary and target roles",
  "Skills: standards and documentation, CAD, instrumentation, programming, manufacturing and quality",
  "Experience: Tindo Solar and Plus 82 Pocha",
  "Project evidence",
  "Education: TAFE SA and Adelaide University",
];

export default function ResumePage() {
  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <section className="page-hero resume-hero">
        <p className="eyebrow">Résumé</p>
        <h1>Solar power<br />{" "}student résumé.</h1>
        <p>This public résumé leads with solar power systems, grid integration, standards-based power design, and Australian solar manufacturing experience. Phone number and street address are left off the public copy.</p>
        <a className="button button-primary" href={profile.resumePath} target="_blank" rel="noopener">
          Download résumé<span className="sr-only"> (PDF, opens in a new tab)</span> <DownloadSimple size={20} aria-hidden="true" />
        </a>
      </section>
      <section className="profile-summary" aria-labelledby="resume-contents-heading">
        <div>
          <p className="eyebrow">Contents</p>
          <h2 id="resume-contents-heading">What the PDF covers</h2>
          <ul className="resume-contents">
            {pdfContents.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="resume-onward">
            The work behind this résumé is published in full: the{" "}
            <Link className="text-link" href="/projects">case studies</Link> carry the calculations, and the{" "}
            <Link className="text-link" href="/workbench">workbench</Link> carries the builds.
          </p>
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
            <dd><a className="text-link" href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a></dd>
          </div>
          <div>
            <dt>Text copy</dt>
            <dd><a className="text-link" href={profile.resumeTextPath}>Plain-text résumé</a></dd>
          </div>
        </dl>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
