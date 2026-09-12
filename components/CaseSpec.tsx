import type { SpecRow } from "@/lib/projects";

// The case-study spec sheet (PLAN v7 S1). Replaces the evidence-chip row on
// case studies that carry structured spec data (`spec` in lib/projects.ts) so
// the scannable numbers sit in a fixed order at the head of the page.
//
// Server-rendered and static: the pinned strip that reuses these rows is added
// separately (PLAN v7 S2). A row without a note renders two cells; the
// "(none)" used in the plan tables is a documentation placeholder and is never
// shipped copy.
export function CaseSpec({ rows, title }: { rows: SpecRow[]; title: string }) {
  return (
    <div className="case-spec">
      <table className="case-spec__table" aria-label={`${title} specification`}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
              {row.note ? <td className="case-spec__note">{row.note}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
