import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ProjectIndexEntry } from "@/lib/project-index";

export function ProjectPortal({ entry }: { entry: ProjectIndexEntry }) {
  return (
    <article className="project-portal">
      <Link
        className="project-portal-link"
        data-project-portal-link
        href={`/projects/${entry.project.slug}`}
      >
        <span className="project-portal-image">
          <Image
            src={entry.miniature.src}
            alt={entry.miniature.alt}
            width={1280}
            height={720}
          />
        </span>
        <div className="project-portal-copy">
          <span className="project-portal-state">{entry.stateLabel}</span>
          <h3 className="project-portal-title">{entry.project.title}</h3>
          <span className="project-portal-summary">{entry.summary}</span>
          <ol className="project-journey" aria-label={`${entry.project.title} project journey`}>
            {entry.stages.map((stage) => (
              <li data-journey-stage={stage.state} key={`${stage.label}-${stage.detail}`}>
                <span>{stage.label}</span>
                <small>{stage.detail}</small>
              </li>
            ))}
          </ol>
          <span className="project-portal-action" aria-hidden="true">
            {entry.ctaLabel} <ArrowRight size={18} weight="regular" />
          </span>
        </div>
      </Link>
    </article>
  );
}
