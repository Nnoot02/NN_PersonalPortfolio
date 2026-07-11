import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { ProjectRow } from "@/components/ProjectRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projects } from "@/lib/projects";
import { absoluteUrl, personStructuredData, profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recruiter & AI Brief",
  description:
    "Plain-text professional profile: target roles, location, technical strengths, project evidence, and public disclosure boundary for recruiters and AI agents.",
};

const profileStructuredData = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  name: "Nathan engineering recruiter brief",
  url: absoluteUrl("/profile"),
  mainEntity: personStructuredData,
};

export default function ProfilePage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileStructuredData) }}
      />
      <section className="page-hero profile-hero">
        <p className="eyebrow">Recruiter / AI brief</p>
        <h1>Professional profile,<br />{" "}in plain text.</h1>
        <p>{profile.summary}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/projects">
            Review evidence <ArrowRight size={20} />
          </Link>
          <a className="button button-secondary" href={profile.resumePath} download>
            Download resume <DownloadSimple size={20} />
          </a>
        </div>
      </section>

      <section className="profile-summary" aria-labelledby="profile-fit-heading">
        <div>
          <p className="eyebrow">Fit</p>
          <h2 id="profile-fit-heading">Target roles and evidence signals</h2>
          <p>
            This page exists so recruiters, search engines, and AI agents can
            extract the same facts a human visitor sees: role target, location,
            technical strengths, project evidence, public disclosure limits,
            resume path, and contact path.
          </p>
        </div>
        <dl className="profile-facts">
          <div>
            <dt>Name</dt>
            <dd>{profile.name}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Current status</dt>
            <dd>{profile.title}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>{profile.contactEmail}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-grid" aria-labelledby="roles-heading">
        <div>
          <p className="eyebrow">Target roles</p>
          <h2 id="roles-heading">What this portfolio should match</h2>
          <ul>
            {profile.targetRoles.map((role) => <li key={role}>{role}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Strengths</p>
          <h2>Evidence worth checking</h2>
          <ul>
            {profile.strengths.map((strength) => <li key={strength}>{strength}</li>)}
          </ul>
        </div>
      </section>

      <section className="featured compact" aria-labelledby="evidence-map-heading">
        <div className="section-heading">
          <p className="eyebrow">Evidence map</p>
          <h2 id="evidence-map-heading">Projects with status</h2>
          <p>
            Each case study uses a problem, approach, result, and evidence
            status structure so the claims are easy to inspect before contact.
          </p>
        </div>
        <div className="project-list">
          {projects.map((project) => <ProjectRow project={project} key={project.slug} />)}
        </div>
      </section>

      <section className="disclosure-panel" aria-labelledby="disclosure-heading">
        <p className="eyebrow">Disclosure boundary</p>
        <h2 id="disclosure-heading">Public, sanitized, and pending content</h2>
        <p>{profile.publicBoundary}</p>
        <ul>
          <li>Resume and email contact are public; phone number and street address are intentionally omitted.</li>
          <li>Project metrics must be measured, defensible, and safe to publish.</li>
          <li>Images support the design, but important claims also appear as text.</li>
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
