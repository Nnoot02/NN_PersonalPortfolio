import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/projects";

export function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="project-row">
      <p className="project-number">{project.number}</p>
      <Link className="project-image" href={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
        <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 760px) 100vw, 34vw" />
      </Link>
      <div className="project-copy">
        <div>
          <p className="eyebrow">Featured project</p>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
        </div>
        <ul className="tag-list" aria-label={`${project.title} skills`}>
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <dl className="project-meta">
          <div><dt>Scope</dt><dd>{project.scope}</dd></div>
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Status</dt><dd>{project.status}</dd></div>
        </dl>
        <Link className="row-action" href={`/projects/${project.slug}`}>
          Read case study <ArrowRight size={20} weight="regular" />
        </Link>
      </div>
      <Link className="row-arrow" href={`/projects/${project.slug}`} aria-label={`Open ${project.title} case study`}>
        <ArrowRight size={29} weight="regular" />
      </Link>
    </article>
  );
}
