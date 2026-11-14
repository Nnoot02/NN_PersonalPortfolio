import { QUADSOLVER_LIMITS, type LimitRow } from "@/lib/quadsolver-limits";

const GROUPS = ["Feasibility", "Warning"] as const;

// Rows without a share are not a fraction of a rating, so they read as text.
function reading(row: LimitRow) {
  if (row.share !== null) return `${row.value} of ${row.limit}`;
  if (row.key === "thrust-to-weight") return `${row.value} against ${row.limit}`;
  if (row.key === "esc-voltage") return `${row.value} in ${row.limit}`;
  return row.value;
}

export function LimitUseFigure() {
  return (
    <figure className="limit-use" data-limit-use>
      {GROUPS.map((cls) => (
        <div className="limit-use__group" data-limit-class={cls} key={cls}>
          <p className="limit-use__class">{cls}</p>
          <dl>
            {QUADSOLVER_LIMITS.filter((row) => row.cls === cls).map((row) => (
              <div data-limit-key={row.key} data-limit-share={row.share !== null ? row.share.toFixed(1) : undefined} key={row.key}>
                <dt>{`${row.label} `}<span className="limit-use__at">{row.at}</span></dt>
                <dd>
                  <span className="limit-use__reading">{reading(row)}</span>
                  {row.share !== null ? (
                    <>
                      <span className="limit-use__track" aria-hidden="true"><span className="limit-use__fill" style={{ width: `${row.share.toFixed(1)}%` }} /></span>
                      <span className="limit-use__share">{`${Math.round(row.share)} %`}</span>
                    </>
                  ) : (
                    <span className="limit-use__note">{row.note}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <figcaption>The nine checks for the 5-inch preset. Six decide feasibility and three are warnings. Model estimates, not measurements.</figcaption>
    </figure>
  );
}
