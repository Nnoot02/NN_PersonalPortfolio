import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/projects";

export function ProjectRow({
  project,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
}) {
  const markers = project.evidenceMarkers ?? project.tags;

  return (
    <article className="project-row">
      <div className="project-image">
        <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 960px) 100vw, 34vw" />
      </div>
      <div className="project-copy">
        <Heading className="project-title">
          <Link className="project-link" href={`/projects/${project.slug}`}>
            {project.title}
          </Link>
        </Heading>
        <p className="project-outcome">{project.summary}</p>
        <ul className="tag-list" aria-label={`${project.title} evidence markers`}>
          {markers.map((marker) => <li key={marker}>{marker}</li>)}
        </ul>
        <span className="row-action" aria-hidden="true">
          Read case study <ArrowRight size={20} weight="regular" />
        </span>
      </div>
    </article>
  );
}
