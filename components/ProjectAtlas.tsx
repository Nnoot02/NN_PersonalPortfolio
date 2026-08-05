import { ProjectPortal } from "@/components/ProjectPortal";
import {
  manufacturingLens,
  projectIndexEntries,
  projectIndexRelations,
} from "@/lib/project-index";

export function ProjectAtlas() {
  return (
    <section className="project-process-section" aria-labelledby="project-journeys-heading">
      <h2 className="sr-only" id="project-journeys-heading">Project journeys</h2>
      <div className="project-process-guide" aria-label="Project journey stages">
        <span>Theory</span>
        <span>System decision</span>
        <span>Verification</span>
      </div>
      <div className="project-atlas-shell">
        <div className="project-atlas-guides" aria-hidden="true"><span /><span /></div>
        <div className="project-atlas-connectors" aria-hidden="true"><span /></div>
        <ol className="project-atlas-list" data-project-atlas>
          {projectIndexEntries.map((entry) => (
            <li data-project-slug={entry.project.slug} key={entry.project.slug}>
              <ProjectPortal entry={entry} />
            </li>
          ))}
        </ol>
      </div>
      <ul className="project-relations" aria-label="Shared project methods">
        {projectIndexRelations.map((relation) => <li key={relation}>{relation}</li>)}
      </ul>
      <aside className="manufacturing-lens" data-manufacturing-lens>
        <p className="eyebrow">{manufacturingLens.title}</p>
        <p>{manufacturingLens.body}</p>
      </aside>
    </section>
  );
}
