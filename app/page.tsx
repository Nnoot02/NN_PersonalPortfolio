import Image from "next/image";
import Link from "next/link";
import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { ProjectRow } from "@/components/ProjectRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkbenchEntryPreview } from "@/components/WorkbenchEntryPreview";
import { broaderEngineeringProjects, verifiedPowerProjects } from "@/lib/projects";
import { profile } from "@/lib/site";
import { getWorkbenchEntry, homepageWorkbenchSlugs } from "@/lib/workbench";

export default function HomePage() {
  const uavCapstone = broaderEngineeringProjects.find((project) => project.slug === "gps-denied-autonomous-uav");
  const homepageWorkbenchEntries = homepageWorkbenchSlugs.map(getWorkbenchEntry).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <main id="main-content">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Electrical engineering student · Adelaide</p>
          <h1 className="hero-name"><span>Nathan</span><span className="hero-surname">No-ot</span></h1>
          <span className="accent-rule" aria-hidden="true" />
          <p className="hero-role">Solar power systems &amp; grid integration</p>
          <p className="hero-summary">Standards-based power design backed by Australian solar manufacturing experience.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#verified-work">
              View selected work <ArrowRight size={20} />
            </a>
            <a className="button button-secondary" href={profile.resumePath} download>
              Download résumé <DownloadSimple size={20} />
            </a>
          </div>
        </div>
        <Link className="hero-image" href="/projects/solar-grid-connection-assessment" aria-label="View 1 MW Solar Grid-Connection Assessment case study">
          <span className="hero-artifact">
            <Image
              src="/images/solar-grid-connection.webp"
              alt="Single-line concept of a 1 MW solar plant connecting to a distribution grid at the point of common coupling"
              fill
              priority
              sizes="(max-width: 960px) 100vw, 54vw"
            />
          </span>
        </Link>
      </section>

      <section className="featured evidence-ledger-section" id="verified-work" aria-labelledby="verified-work-heading">
        <div className="section-heading">
          <p className="eyebrow">Verified power engineering</p>
          <h2 id="verified-work-heading">Power Systems Work</h2>
          <p>Completed power work, ordered by direct relevance to solar systems and grid integration.</p>
        </div>
        <ol className="project-list" data-evidence-ledger>
          {verifiedPowerProjects.map((project) => (
            <li data-project-slug={project.slug} key={project.slug}><ProjectRow project={project} /></li>
          ))}
        </ol>
      </section>

      <section className="tindo-strip" aria-labelledby="tindo-heading">
        <div>
          <p className="footer-kicker">Experience</p>
          <h2 id="tindo-heading">Tindo Solar</h2>
        </div>
        <dl>
          <div><dt>Role</dt><dd>Production Worker</dd></div>
          <div><dt>Since</dt><dd>Nov 2025–present</dd></div>
          <div><dt>Context</dt><dd>Australian solar-panel manufacturing experience</dd></div>
        </dl>
        <p>Production-line work in a Kaizen and 5S culture.</p>
      </section>

      <section className="featured workbench-home" data-workbench-home aria-labelledby="workbench-home-heading">
        <div className="section-heading">
          <p className="eyebrow">After hours</p>
          <h2 id="workbench-home-heading">Workbench</h2>
          <p>Personal builds that keep my hands in the details: what I made, what worked, and what I would change next.</p>
        </div>
        <div className="workbench-home-grid">
          {homepageWorkbenchEntries.map((entry) => <WorkbenchEntryPreview entry={entry} headingLevel="h3" key={entry.slug} />)}
        </div>
        <Link className="text-link workbench-collection-link" href="/workbench">See all bench builds <ArrowRight size={18} /></Link>
      </section>

      {uavCapstone ? (
        <section className="featured broader-work" aria-labelledby="broader-work-heading">
          <div className="section-heading">
            <p className="eyebrow">Current and broader engineering work</p>
            <h2 id="broader-work-heading">GPS-Denied UAV Capstone</h2>
            <p>Active work stays visible without displacing completed, verified power evidence.</p>
          </div>
          <ol className="project-list">
            <li data-project-slug={uavCapstone.slug}>
              <p className="project-status-label">Active capstone—systems design in progress</p>
              <ProjectRow project={uavCapstone} />
            </li>
          </ol>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
