"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LV_DESIGN_BASIS, type BasisEntry, type BasisId } from "@/lib/lv-design-basis";

// The hero artifact's interaction island. Hovering a component (or its legend
// row) paints that component's linework in accent via CSS (:has); clicking a
// component (or pressing Enter/Space on its row) opens its detail in the panel
// under the drawing, sticky until the same target is clicked again or Escape.
// Without JS the SSR frame still shows the finished drawing and the seven
// default rows.

type TargetId = Exclude<BasisId, "trench">;

type Target = Omit<BasisEntry, "id"> & {
  id: TargetId;
  // hit area over the feature, as percentages of the 1200x800 stage
  hit: { x: string; y: string; w: string; h: string };
};

// Names, values and details live in lib/lv-design-basis.ts; only the hit
// areas belong to this drawing.
const HITS: Record<TargetId, Target["hit"]> = {
  supply: { x: "11.7%", y: "7.5%", w: "13.3%", h: "14.0%" },
  mains: { x: "16.5%", y: "22.5%", w: "6.3%", h: "14.0%" },
  vd: { x: "35.5%", y: "33.0%", w: "12.5%", h: "5.5%" },
  device: { x: "16.5%", y: "36.5%", w: "6.3%", h: "10.0%" },
  sup: { x: "43.3%", y: "45.0%", w: "12.5%", h: "37.5%" },
  hai: { x: "61.7%", y: "45.0%", w: "12.1%", h: "37.5%" },
  but: { x: "79.6%", y: "45.0%", w: "12.5%", h: "37.5%" },
};

const TARGETS: Target[] = (Object.keys(HITS) as TargetId[]).map((id) => ({ ...LV_DESIGN_BASIS[id], id, hit: HITS[id] }));

export function FeaturedSldInteractive({ svg, plotEnd, stageAction }: { svg: string; plotEnd: string; stageAction?: ReactNode }) {
  const panelId = useId();
  const [active, setActive] = useState<TargetId | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Partial<Record<TargetId, HTMLButtonElement | null>>>({});
  // focus management (R1 finding 2): opening from a row moves focus into the
  // detail while the legend stays available for comparison; closing
  // from the keyboard or the close button hands focus back to that row.
  const restoreTo = useRef<TargetId | null>(null);
  const openedFromRow = useRef(false);
  const restoreFocus = useRef(false);

  const drawing = useMemo(
    () => <div className="hero-sld-svg" dangerouslySetInnerHTML={{ __html: svg }} />,
    [svg],
  );

  const toggle = useCallback((id: TargetId) => {
    setActive((current) => (current === id ? null : id));
  }, []);

  const openFromRow = useCallback((id: TargetId) => {
    restoreTo.current = id;
    openedFromRow.current = true;
    toggle(id);
  }, [toggle]);

  const closeFromKey = useCallback(() => {
    // Pointer targets have a matching legend row too. Restore to the selected
    // component whether the detail was opened by keyboard, touch, or drawing.
    restoreTo.current = active;
    restoreFocus.current = true;
    setActive(null);
  }, [active]);

  useEffect(() => {
    if (active) {
      if (openedFromRow.current) {
        openedFromRow.current = false;
        detailRef.current?.focus();
      }
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      const row = restoreTo.current ? rowRefs.current[restoreTo.current] : null;
      restoreTo.current = null;
      row?.focus({ preventScroll: true });
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFromKey();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeFromKey]);

  return (
    <div className="hero-artifact-figure" data-active={active ?? undefined}>
      <div className="hero-sld" style={{ "--plot-end": plotEnd } as CSSProperties}>
        <div className="hero-sld-stage">
          {/* memoized: re-rendering this subtree re-sets the innerHTML node and
              replays the whole plot animation (measured on the built page) */}
          {drawing}
          {/* pointer-only (audit U4): the labelled rows are the one keyboard and
              screen-reader path, so Tab no longer walks the same seven targets twice */}
          <span className="hero-sld-hits" aria-hidden="true">
            {TARGETS.map((t, i) => (
              <button
                type="button"
                key={t.id}
                className="hero-sld-hit"
                tabIndex={-1}
                data-target={t.id}
                aria-pressed={active === t.id}
                aria-label={`${t.name}: ${t.value}`}
                style={{ "--x": t.hit.x, "--y": t.hit.y, "--w": t.hit.w, "--h": t.hit.h, "--ping-i": i } as CSSProperties}
                // a click must not focus a node inside aria-hidden (Chrome blocks
                // that and warns); the click itself still toggles
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggle(t.id)}
              />
            ))}
          </span>
          {/* the drawing's bottom-right corner is clear of art (x > 700, y > 690
              of the 1200x800 canvas); below the 560.5px boundary CSS drops this
              into a row under the stage instead */}
          {stageAction}
        </div>
      </div>
      {/* Rows show names only; the drawing already prints each value and the
          detail repeats it. Without JS there is no detail, so the values return. */}
      <noscript><style>{".hero-sld-detail { display: none; } .hero-sld-row-disclosure { visibility: hidden; } .hero-sld-row-value { position: static; width: auto; height: auto; margin: 0; overflow: visible; clip: auto; white-space: normal; }"}</style></noscript>
      <div className="hero-sld-panel" style={{ "--plot-end": plotEnd } as CSSProperties}>
        <ul className="hero-sld-rows">
          {TARGETS.map((t, i) => (
            <li key={t.id}>
              <button
                type="button"
                className="hero-sld-row"
                data-target={t.id}
                aria-expanded={active === t.id}
                aria-controls={`${panelId}-${t.id}`}
                style={{ "--ping-i": i } as CSSProperties}
                ref={(el) => { rowRefs.current[t.id] = el; }}
                onClick={() => openFromRow(t.id)}
              >
                <span className="hero-sld-row-name">{t.name}</span>
                <span className="hero-sld-row-value">{t.value}</span>
                <span className="hero-sld-row-disclosure" aria-hidden="true">+</span>
              </button>
            </li>
          ))}
        </ul>
        {/* collapsed until a row opens; all seven details share one cell, so
            every open state has one height and switching never jumps */}
        <div className="hero-sld-details">
        {TARGETS.map((t) => (
          <div
            className="hero-sld-detail"
            data-target={t.id}
            id={`${panelId}-${t.id}`}
            key={t.id}
            tabIndex={-1}
            ref={(el) => { if (active === t.id) detailRef.current = el; }}
          >
            <p className="hero-sld-detail-title">{`${t.name} · ${t.value}`}</p>
            <p className="hero-sld-detail-body">{t.detail}</p>
            <button type="button" className="hero-sld-detail-close" aria-label="Close the detail" onClick={closeFromKey}>
              ✕
            </button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
