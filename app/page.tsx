import Image from "next/image";
import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { HomepageEpilogue } from "@/components/HomepageEpilogue";
import { ProjectRow } from "@/components/ProjectRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { broaderEngineeringProjects, verifiedPowerProjects } from "@/lib/projects";
import { profile } from "@/lib/site";
import { getWorkbenchEntry } from "@/lib/workbench";

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
          <h1 className="hero-name"><span>Nathan</span><span className="hero-surname">No-ot</span></h1>
          <span className="accent-rule" aria-hidden="true" />
          <p className="hero-role">Power systems · networks · renewable integration</p>
          <p className="hero-summary">I design from standards and verify decisions with calculations—backed by Australian solar-manufacturing exposure.</p>
          <p className="hero-credential">Currently · Production Worker · Tindo Solar · Nov 2025–present</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#verified-work">
              View selected work <ArrowRight size={20} />
            </a>
            <a className="button button-secondary" href={profile.resumePath} download>
              Download résumé <DownloadSimple size={20} />
            </a>
          </div>
        </div>
        <figure className="hero-image">
          <span className="hero-artifact">
            <Image
              src="/images/lv-cabling-design.webp"
              alt="One-line diagram of a 400 V three-tenancy installation from supply transformer to distribution boards"
              fill
              priority
              sizes="(max-width: 960px) 100vw, 54vw"
            />
          </span>
        </figure>
      </section>

      <section className="featured evidence-ledger-section" id="verified-work" aria-labelledby="verified-work-heading">
        <div className="section-heading">
          <p className="eyebrow">Verified power engineering</p>
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
