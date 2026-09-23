import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { CaseOpening } from "@/components/CaseOpening";
import { CaseSpec } from "@/components/CaseSpec";
import { LvCablingWriteUp } from "@/components/LvCablingWriteUp";
import { PvConnectionWriteUp } from "@/components/PvConnectionWriteUp";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { UavTestGatesWriteUp } from "@/components/UavTestGatesWriteUp";
import { projectStudyNext } from "@/lib/project-index";
import { projects } from "@/lib/projects";
import { profile, projectStructuredData, sharedOpenGraph } from "@/lib/site";

const writeUps: Record<string, React.ComponentType> = {
  "lv-cabling-design-commercial-complex": LvCablingWriteUp,
  "solar-grid-connection-assessment": PvConnectionWriteUp,
  "gps-denied-autonomous-uav": UavTestGatesWriteUp,
};

// Write-up section links per case study (the ids live in the write-up
// components; only case studies with anchored sections get links).
const openingLinks: Record<string, Array<{ label: string; href: string }>> = {
  "lv-cabling-design-commercial-complex": [
    { label: "Maximum demand", href: "#maximum-demand" },
    { label: "Consumer mains", href: "#consumer-mains" },
    { label: "Earthing and protection", href: "#earthing-and-protection" },
  ],
  "solar-grid-connection-assessment": [
    { label: "Three capacities", href: "#three-capacities" },
    { label: "Connection voltage", href: "#connection-voltage" },
    { label: "Hosting capacity", href: "#hosting-capacity" },
  ],
};

type ProjectParams = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectParams): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.summary,
    keywords: project.tags,
    // Next replaces openGraph wholesale, so spread the shared object first or
    // site_name, locale and the image dimensions are dropped from the card.
    openGraph: {
      ...sharedOpenGraph,
      title: project.title,
      description: project.summary,
      type: "article",
      url: `/projects/${project.slug}`,
      images: [{ url: project.image, alt: project.imageAlt }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectParams) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const WriteUp = writeUps[project.slug];

  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectStructuredData(project)) }}
      />
      <article className="case-study">
        <Link className="back-link" href="/projects"><ArrowLeft size={18} /> Project index</Link>
        <p className="eyebrow">{project.number ? `Case study ${project.number}` : "Case study"}</p>
        <h1>{project.title}</h1>
        <p className="case-status">{project.status}</p>
        <p className="case-lede">{project.summary}</p>
        <CaseOpening
          role={project.role}
          outcome={project.result}
          limitation={project.evidenceStatus}
          links={openingLinks[project.slug] ?? []}
        />
        {project.spec ? (
          <CaseSpec rows={project.spec} title={project.title} />
        ) : (
          <ul className="tag-list case-tags" aria-label={`${project.title} evidence markers`}>
            {(project.evidenceMarkers ?? project.tags).map((marker) => <li key={marker}>{marker}</li>)}
          </ul>
        )}
        <div className="case-image"><Image src={project.image} alt={project.imageAlt} fill priority sizes="100vw" /></div>
        {project.imageIsDiagram ? (
          <p className="case-image-note">
            {project.imageNote ? <span className="case-image-provenance">{project.imageNote} </span> : null}
            <a className="text-link" href={project.image} target="_blank" rel="noopener">
              Open the full-size diagram<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        ) : null}
        <dl className="case-meta">
          <div><dt>Scope</dt><dd>{project.scope}</dd></div>
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Status</dt><dd>{project.status}</dd></div>
        </dl>
        <section className="case-sections" aria-label={`${project.title} evidence summary`}>
          <div>
            <p className="eyebrow">Problem</p>
            <h2>What needed solving</h2>
            <p>{project.problem}</p>
          </div>
          <div>
            <p className="eyebrow">Approach</p>
            <h2>How the work is framed</h2>
            <p>{project.approach}</p>
          </div>
          <div>
            <p className="eyebrow">Result</p>
            <h2>Current public outcome</h2>
            <p>{project.result}</p>
          </div>
          <div>
            <p className="eyebrow">Evidence status</p>
            <h2>Limits and open items</h2>
            <p>{project.evidenceStatus}</p>
          </div>
        </section>
        {WriteUp ? <WriteUp /> : null}
        {projectStudyNext[project.slug] ? (
          <p className="case-next">
            Next in the evidence:{" "}
            <Link className="text-link" href={`/projects/${projectStudyNext[project.slug].slug}`}>
              {projects.find((item) => item.slug === projectStudyNext[project.slug].slug)?.title}
            </Link>{" "}
            - {projectStudyNext[project.slug].label}.
          </p>
        ) : null}
        <p className="case-contact">
          Questions about this design? <a className="text-link" href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a>
        </p>
      </article>
    </main>
    <SiteFooter />
    </>
  );
}
