"use client";

import { useEffect, useRef } from "react";
import type { SpecRow } from "@/lib/projects";

// The case-study spec sheet (PLAN v7 S1) and its pinned strip (PLAN v7 S2).
// The sheet replaces the evidence-chip row on case studies that carry
// structured spec data (`spec` in lib/projects.ts); a row without a note
// renders two cells, and placeholder text is never shipped.
//
// The strip is a duplicate, non-interactive readout of the same rows
// (Standards excluded, notes omitted), pinned under the header while the
// write-up is read. It exists only at >=1100px, the measured threshold where
// every strip line fits with slack; it is aria-hidden and carries no
// focusables, and with JavaScript off it never appears, so below the
// threshold and without scripts the sheet simply reads normally. One observer
// on the table drives the state: the strip retracts as soon as the table
// re-enters the viewport.
export function CaseSpec({ rows, title }: { rows: SpecRow[]; title: string }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    const strip = stripRef.current;
    if (!table || !strip) return;
    const mq = window.matchMedia("(min-width: 1100px)");

    const update = () => {
      strip.classList.toggle("is-on", mq.matches && table.getBoundingClientRect().bottom <= 1);
    };

    update();
    // Rev 4 (audit D2): the observer is crossing-driven, and at 200% text the
    // table starts below the fold, so a jump to a deep section goes from
    // below-viewport to above-viewport without ever intersecting the default
    // root -- no crossing, no update, strip off for the rest of the session.
    // Extending the root downwards makes the below-fold state intersect, so
    // the arrival jump crosses the top boundary and fires.
    const io = new IntersectionObserver(update, { rootMargin: "0px 0px 9999px 0px" });
    io.observe(table);
    mq.addEventListener("change", update);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", update);
      strip.classList.remove("is-on");
    };
  }, []);

  return (
    <div className="case-spec">
      <table ref={tableRef} className="case-spec__table" aria-label={`${title} specification`}>
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
      {/* Standards rows are reference material and stay out of the strip
          (Nathan, 2026-09-12); notes are omitted to keep the line slim. */}
      <div ref={stripRef} className="case-spec__strip" aria-hidden="true">
        {rows.filter((row) => row.label !== "Standards").map((row) => (
          <span className="case-spec__strip-item" key={row.label}>{row.label} <b>{row.value}</b></span>
        ))}
      </div>
    </div>
  );
}
