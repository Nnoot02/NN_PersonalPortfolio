import { ProjectJourneyLane, type ProjectJourneyRelation } from "@/components/ProjectJourneyLane";
import { projectIndexEntries, projectIndexGroups, projectIndexRelation } from "@/lib/project-index";

export function ProjectJourneyLanes() {
  const source = projectIndexEntries.find((entry) => entry.project.slug === projectIndexRelation.sourceSlug);
  const target = projectIndexEntries.find((entry) => entry.project.slug === projectIndexRelation.targetSlug);

  if (!source || !target) {
    throw new Error("Project journey relationship endpoints must exist in the project index");
  }

  const relation: ProjectJourneyRelation = {
    sourceSlug: projectIndexRelation.sourceSlug,
    targetSlug: projectIndexRelation.targetSlug,
    sourceTitle: source.project.title,
    targetTitle: target.project.title,
    label: projectIndexRelation.label,
  };

  return (
    <section className="project-journey-section" aria-labelledby="project-journeys-heading">
      <h2 className="sr-only" id="project-journeys-heading">Project journeys</h2>
      <div className="project-journey-guide" aria-label="Project journey stages">
        <span>Project anchor</span>
        <span>Theory / planning</span>
        <span>System decision</span>
        <span>Verification</span>
      </div>
      <ol className="project-journey-list" data-project-journeys>
        {projectIndexGroups.map((group) => [
          <li className="project-journey-group" key={group.id}>
            <h3 id={`project-group-${group.id}`}>{group.heading}</h3>
          </li>,
          ...group.slugs.map((slug) => {
            const entry = projectIndexEntries.find((candidate) => candidate.project.slug === slug);
            if (!entry) throw new Error(`Project index group references a missing slug: ${slug}`);
            return (
              <li data-project-slug={entry.project.slug} key={entry.project.slug}>
                <ProjectJourneyLane entry={entry} relation={entry.project.slug === projectIndexRelation.sourceSlug ? relation : undefined} />
              </li>
            );
          }),
        ])}
      </ol>
    </section>
  );
}
