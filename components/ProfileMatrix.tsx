import Link from "next/link";
import { PROFILE_LENSES, PROFILE_MATRIX, type MatrixRow } from "@/lib/profile-matrix";
import { projects } from "@/lib/projects";

// The /profile verification matrix (plan 2026-11-15-002). Each row quotes its
// case study: the title and the key figure come from lib/projects.ts, and a
// missing slug or CaseSpec label throws at build, so a renamed label fails the
// build rather than the page. The lens is the LvDesignViews pattern: visually
// hidden radios, and screen-only :has() rules in globals.css hide the other
// lens's rows. Without :has() every row stays visible, which is the All state.
// The explicit table roles keep the semantics when the rows restack as grids
// on narrow screens.

function resolve(row: MatrixRow) {
  const project = projects.find((candidate) => candidate.slug === row.slug);
  if (!project) throw new Error(`ProfileMatrix: no project with slug "${row.slug}"`);
  const spec = project.spec?.find((candidate) => candidate.label === row.specLabel);
  if (!spec) throw new Error(`ProfileMatrix: ${row.slug} has no CaseSpec row labelled "${row.specLabel}"`);
  return { ...row, title: project.title, value: spec.value };
}

export function ProfileMatrix() {
  const rows = PROFILE_MATRIX.map(resolve);
  return (
    <div className="profile-matrix" data-profile-matrix="">
      <div className="profile-lens-switch" role="radiogroup" aria-label="Show projects for">
        {PROFILE_LENSES.map((lens, index) => (
          <label key={lens.id} className="profile-lens-tab">
            <input
              className="profile-lens-radio"
              type="radio"
              name="profile-lens"
              id={`profile-lens-${lens.id}`}
              defaultChecked={index === 0}
            />
            <span>{lens.label}</span>
          </label>
        ))}
      </div>
      <table className="profile-matrix__table" role="table" aria-labelledby="evidence-map-heading">
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">Project</th>
            <th scope="col" role="columnheader">Basis</th>
            <th scope="col" role="columnheader">Key figure</th>
            <th scope="col" role="columnheader">Evidence</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row) => (
            <tr key={row.slug} role="row" data-matrix-slug={row.slug} data-lens={row.lens}>
              <th scope="row" role="rowheader">
                <Link className="text-link" href={`/projects/${row.slug}`}>{row.title}</Link>
              </th>
              <td role="cell" data-label="Basis">{row.basis}</td>
              <td role="cell" data-label="Key figure">
                <span className="profile-matrix__fig-label">{row.specLabel}</span>{" "}
                <span className="profile-matrix__fig-value">{row.value}</span>
              </td>
              <td role="cell" data-label="Evidence">{row.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
