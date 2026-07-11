import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { ProjectRow } from "@/components/ProjectRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { featuredProjects } from "@/lib/projects";
import { profile } from "@/lib/site";

export default function HomePage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Electrical engineering portfolio</p>
          <h1>Nathan</h1>
          <p className="hero-role">Systems-minded electrical engineer</p>
          <span className="accent-rule" aria-hidden="true" />
          <p className="hero-summary">Power. Embedded. Controls. Verification.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/projects">
              View projects <ArrowRight size={20} />
            </Link>
            <a className="button button-secondary" href={profile.resumePath} download>
              Download resume <DownloadSimple size={20} />
            </a>
          </div>
          <p className="placeholder-note">
            General resume is live. Some project evidence remains pending where marked.
            <Link className="text-link" href="/profile"> Read the plain-text recruiter brief.</Link>
          </p>
        </div>
        <div className="hero-image">
          <Image
            src="/images/pcb-hero.webp"
            alt="Probe and soldering iron positioned over a populated circuit board"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 54vw"
          />
        </div>
        <a className="scroll-cue" href="#featured" aria-label="Scroll to featured projects">
          <span>Selected work</span><ArrowDown size={19} />
        </a>
      </section>

      <section className="featured" id="featured">
        <div className="section-heading">
          <p className="eyebrow">Featured projects</p>
          <h2>Selected engineering work</h2>
          <p>Three systems. Clear decisions. Resume-backed evidence ready for verified problem, approach, result, and measurement details.</p>
        </div>
        <div className="project-list">
          {featuredProjects.map((project) => <ProjectRow project={project} key={project.slug} />)}
        </div>
      </section>

      <section className="principles" aria-label="Engineering strengths">
        <div><span>01</span><h3>Systems thinker</h3><p>Connect requirements, interfaces, risks, and verification.</p></div>
        <div><span>02</span><h3>Hands-on builder</h3><p>Move from schematics and firmware to integration and test.</p></div>
        <div><span>03</span><h3>Clear communicator</h3><p>Document decisions so teams can review and improve them.</p></div>
      </section>
      <SiteFooter />
    </main>
  );
}
