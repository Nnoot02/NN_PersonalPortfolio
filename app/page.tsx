import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
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

export default function HomePage() {
  const uavProject = requireHomepageProject("gps-denied-autonomous-uav");
  const workbenchEntry = requireHomepageWorkbenchEntry("bench-fume-extractor");

  return (
    <main id="main-content">
      <SiteHeader />
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
          </dl>
          <div className="hero-actions">
            <a className="button button-primary" href={profile.resumePath} target="_blank" rel="noopener">
              Download résumé<span className="sr-only"> (PDF, opens in a new tab)</span> <DownloadSimple size={20} />
            </a>
          </div>
        </div>
        <figure className="hero-image">
          <Link className="hero-artifact" href="/projects/lv-cabling-design-commercial-complex">
            <Image
              src="/images/lv-cabling-sld.svg"
              alt="Featured artifact: one-line diagram of the 400 V three-tenancy design, from a 500 kVA supply transformer through the main switchboard to the three tenancy distribution boards"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 960px) 100vw, 54vw"
            />
            <span className="sr-only">Open the Commercial LV Cabling Design case study</span>
          </Link>
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
            <li data-project-slug={project.slug} key={project.slug}><ProjectRow project={project} /></li>
          ))}
        </ol>
      </section>

      <HomepageEpilogue uavProject={uavProject} workbenchEntry={workbenchEntry} />
      <SiteFooter />
    </main>
  );
}
