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
import { ViasatEntryWriteUp } from "@/components/ViasatEntryWriteUp";
import { projectStudyNext } from "@/lib/project-index";
import { projects } from "@/lib/projects";
import { profile, projectStructuredData, sharedOpenGraph } from "@/lib/site";
import { routeLastModified } from "@/lib/route-last-modified";

const writeUps: Record<string, React.ComponentType> = {
  "lv-cabling-design-commercial-complex": LvCablingWriteUp,
  "solar-grid-connection-assessment": PvConnectionWriteUp,
  "gps-denied-autonomous-uav": UavTestGatesWriteUp,
  "last-metre-eyes-viasat-entry": ViasatEntryWriteUp,
};

const shareImages: Record<string, { url: string; width: number; height: number }> = {
  "lv-cabling-design-commercial-complex": { url: "/images/project-index/lv-cabling-artifact.webp", width: 1280, height: 720 },
  "solar-grid-connection-assessment": { url: "/images/solar-grid-connection.webp", width: 1536, height: 1024 },
  "gps-denied-autonomous-uav": { url: "/images/gps-denied-uav.webp", width: 1920, height: 1080 },
  "last-metre-eyes-viasat-entry": { url: "/images/viasat-entry/journey.webp", width: 1920, height: 1080 },
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
  "last-metre-eyes-viasat-entry": [
    { label: "Two segments", href: "#two-segments" },
    { label: "The local link", href: "#local-link" },
    { label: "Impact metrics", href: "#metrics" },
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
      images: [{ ...shareImages[project.slug], type: "image/webp", alt: project.imageAlt }],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...projectStructuredData(project), dateModified: routeLastModified(`/projects/${project.slug}`).toISOString() }) }}
      />
      <article className="case-study">
        <Link className="back-link" href="/projects"><ArrowLeft size={18} /> Project index</Link>
        <p className="eyebrow">{project.number ? `Case study ${project.number}` : "Case study"}</p>
        <h1>{project.title}</h1>
        <p className="case-status">{project.status}</p>
        {!WriteUp ? <p className="case-lede">{project.summary}</p> : null}
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
        <div className="case-image">
          {/* The export is unoptimized, so next/image emits no srcset. The
              photographic heroes carry pre-generated widths instead. */}
          {project.heroSrcSet ? (
            <picture>
              <source srcSet={project.heroSrcSet} sizes="(max-width: 720px) calc(100vw - 40px), min(100vw, 1240px)" />
              <Image src={project.image} alt={project.imageAlt} fill priority sizes="(max-width: 720px) calc(100vw - 40px), min(100vw, 1240px)" />
            </picture>
          ) : (
            <Image src={project.image} alt={project.imageAlt} fill priority sizes="100vw" />
          )}
        </div>
        {project.imageNote && !project.imageIsDiagram ? (
          <p className="case-image-note case-image-provenance">{project.imageNote}</p>
        ) : null}
        {project.imageIsDiagram ? (
          <p className="case-image-note">
            {project.imageNote ? <span className="case-image-provenance">{project.imageNote} </span> : null}
            <a className="text-link" href={project.image} target="_blank" rel="noopener">
              Open the full-size diagram<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        ) : null}
        <p className="case-scope"><span className="eyebrow">Scope</span> {project.scope}</p>
        {WriteUp ? <WriteUp /> : null}
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
        </section>
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
        <p className="case-resume">
          The résumé is the short version of this work:{" "}
          <Link className="text-link" href="/resume">résumé overview</Link>, or the{" "}
          <a className="text-link" href={profile.resumePath}>PDF</a>.
        </p>
      </article>
    </main>
    <SiteFooter />
    </>
  );
}
