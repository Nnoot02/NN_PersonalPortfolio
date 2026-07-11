import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { LvCablingWriteUp } from "@/components/LvCablingWriteUp";
import { PvConnectionWriteUp } from "@/components/PvConnectionWriteUp";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projects } from "@/lib/projects";
import { projectStructuredData } from "@/lib/site";

const writeUps: Record<string, React.ComponentType> = {
  "lv-cabling-design-commercial-complex": LvCablingWriteUp,
  "solar-grid-connection-assessment": PvConnectionWriteUp,
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
    openGraph: {
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
    <main id="main-content">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectStructuredData(project)) }}
      />
      <article className="case-study">
        <Link className="back-link" href="/projects"><ArrowLeft size={18} /> Project index</Link>
        <p className="eyebrow">Case study {project.number}</p>
        <h1>{project.title}</h1>
        <p className="case-status">{project.status}</p>
        <p className="case-lede">{project.summary}</p>
        <ul className="tag-list case-tags" aria-label={`${project.title} skills`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="case-image"><Image src={project.image} alt={project.imageAlt} fill priority sizes="100vw" /></div>
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
            <h2>What still needs proof</h2>
            <p>{project.evidenceStatus}</p>
          </div>
        </section>
        {WriteUp ? <WriteUp /> : null}
        {!project.evidenceVerified ? (
          <div className="placeholder-panel">
            <p className="eyebrow">Content gate</p>
            <h2>Evidence interview required</h2>
            <p>Replace this panel with verified measurements, your individual contribution, test evidence, failures, revisions, and public-safe images before publishing.</p>
          </div>
        ) : null}
      </article>
      <SiteFooter />
    </main>
  );
}
