import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ProjectIndexEntry } from "@/lib/project-index";

export type ProjectJourneyRelation = {
  sourceSlug: string;
  targetSlug: string;
  sourceTitle: string;
  targetTitle: string;
  label: string;
};

export function ProjectJourneyLane({ entry, relation }: { entry: ProjectIndexEntry; relation?: ProjectJourneyRelation }) {
  return (
    <>
      <article className="project-journey-lane">
        <Link
          className="project-journey-link"
          data-project-journey-link
          href={"/projects/" + entry.project.slug}
        >
          <div className="project-journey-anchor">
            <div className="project-journey-anchor-top">
              <span className="project-journey-image">
                <Image
                  src={entry.miniature.src}
                  alt={entry.miniature.alt}
                  width={1280}
                  height={720}
                />
              </span>
              <div className="project-journey-copy">
                <span className="project-journey-state">{entry.stateLabel}</span>
                <h3 className="project-journey-title">{entry.project.title}</h3>
                <span className="project-journey-action" aria-hidden="true">
                  {entry.ctaLabel} <ArrowRight size={18} weight="regular" />
                </span>
              </div>
            </div>
            <p className="project-journey-summary">{entry.summary}</p>
          </div>
        </Link>
      </article>
      {relation ? (
        <p
          className="project-journey-relation"
          data-project-relation
          data-source-slug={relation.sourceSlug}
          data-target-slug={relation.targetSlug}
        >
          {relation.sourceTitle} <span aria-hidden="true">↔</span>{" "}
          <span className="sr-only">relates to </span>
          {relation.targetTitle}: {relation.label}
        </p>
      ) : null}
      <ol className="project-journey-stages" aria-label={entry.project.title + " project journey"}>
        {entry.stages.map((stage) => (
          <li data-journey-stage={stage.state} key={stage.label + "-" + stage.detail}>
            <span className="project-journey-stage-label">{stage.label}</span>
            <small>{stage.detail}</small>
            {stage.state !== "resolved" ? (
              <span className="project-journey-stage-state">{stage.state === "current" ? "Current" : "Future"}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
