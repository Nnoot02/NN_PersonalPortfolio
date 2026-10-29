import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { FeaturedSldArtifact } from "@/components/FeaturedSld";
import { HomepageEpilogue } from "@/components/HomepageEpilogue";
import { ProjectRow } from "@/components/ProjectRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { broaderEngineeringProjects, verifiedPowerProjects } from "@/lib/projects";
import { profile, sharedOpenGraph } from "@/lib/site";
import { getWorkbenchEntry } from "@/lib/workbench";

// The root layout declares og:type "website", which is right for every other
// inherited route. Only the homepage is a profile. Next replaces openGraph
// wholesale, so spread the shared object rather than restating its keys.
export const metadata: Metadata = {
  openGraph: { ...sharedOpenGraph, type: "profile" },
};

function requireHomepageProject(slug: string) {
  const project = broaderEngineeringProjects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Missing required homepage project: ${slug}`);
  return project;
}

function requireHomepageWorkbenchEntry(slug: string) {
  const entry = getWorkbenchEntry(slug);
  if (!entry) throw new Error(`Missing required homepage Workbench entry: ${slug}`);
  return entry;
}

// The hero already shows the LV one-line diagram, so the LV row takes the
// installation cutaway: two views of the design instead of one twice.
const rowImages: Record<string, { src: string; alt: string }> = {
  "lv-cabling-design-commercial-complex": {
    src: "/images/lv-cabling-installation.svg",
    alt: "Indicative cutaway of the 400 V installation: padmount kiosk, buried submains and risers to three tenancy boards",
  },
};

export default function HomePage() {
  const uavProject = requireHomepageProject("gps-denied-autonomous-uav");
  const workbenchEntry = requireHomepageWorkbenchEntry("bench-fume-extractor");

  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <div className="home-hero-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Electrical engineering student · Adelaide</p>
           <h1 className="hero-name"><span>Nathan</span>{" "}<span className="hero-surname">No-ot</span></h1>
          <span className="accent-rule" aria-hidden="true" />
          <p className="hero-role">Power systems and grid integration</p>
          <p className="hero-summary">I design to AS/NZS standards and publish the working, so please feel free to check it.</p>
          <dl className="hero-credential">
            <div>
              <dt>Currently</dt>
              <dd>Electrical Engineering Intern, Tindo Solar</dd>
            </div>
            <div>
              <dt>Since</dt>
              <dd>Aug 2026</dd>
            </div>
            <div>
              <dt>Studying</dt>
              <dd>Associate Degree in Electronics Engineering, TAFE SA</dd>
            </div>
            <div>
              <dt>Articulating</dt>
              <dd>BE Electrical &amp; Electronic, Adelaide University (expected 2028)</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>South Australian internships</dd>
            </div>
          </dl>
          <div className="hero-actions">
            <Link className="button button-primary" href="/projects">
              View projects <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <a className="button button-secondary" href={profile.resumePath} target="_blank" rel="noopener">
              Résumé PDF<span className="sr-only"> (PDF, opens in a new tab)</span> <DownloadSimple size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
        <figure className="hero-image">
          <div className="hero-artifact">
            <FeaturedSldArtifact
              stageAction={
                <a className="hero-artifact-full-size text-link" href="/images/lv-cabling-sld.svg" target="_blank" rel="noopener">
                  Open the full-size diagram<span className="sr-only"> (opens in a new tab)</span> <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              }
            />
            <Link className="hero-artifact-caption" href="/projects/lv-cabling-design-commercial-complex">
              <span className="hero-artifact-caption-text">Commercial LV cabling design - 400 V, three tenancies</span>
              <span className="hero-artifact-action">Open the case study</span>
            </Link>
          </div>
        </figure>
      </section>

      <section className="featured evidence-ledger-section" id="verified-work" aria-labelledby="verified-work-heading">
        <div className="section-heading">
          <p className="eyebrow">AS/NZS 3000 and 3008.1.1</p>
          <h2 id="verified-work-heading">Power Systems Work</h2>
          <p>Completed studies showing decisions, standards, calculations, and limitations.</p>
        </div>
        <ol className="project-list" data-evidence-ledger>
          {verifiedPowerProjects.map((project) => (
            <li data-project-slug={project.slug} key={project.slug}><ProjectRow project={project} image={rowImages[project.slug]} /></li>
          ))}
        </ol>
      </section>
      </div>

      <HomepageEpilogue uavProject={uavProject} workbenchEntry={workbenchEntry} />
    </main>
    <SiteFooter droneStop />
    </>
  );
}
