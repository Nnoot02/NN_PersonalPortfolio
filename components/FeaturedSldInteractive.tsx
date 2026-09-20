"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

// The hero artifact's interaction island. Hovering a component (or its legend
// row) paints that component's linework in accent via CSS (:has); clicking a
// component (or pressing Enter/Space on its row) opens its detail in the panel
// under the drawing, sticky until the same target is clicked again or Escape.
// Without JS the SSR frame still shows the finished drawing and the seven
// default rows.

type TargetId = "supply" | "mains" | "vd" | "device" | "sup" | "hai" | "but";

type Target = {
  id: TargetId;
  name: string;
  value: string;
  detail: string;
  // hit area over the feature, as percentages of the 1200x800 stage
  hit: { x: string; y: string; w: string; h: string };
};

// Copy traced to components/LvCablingWriteUp.tsx and the project brief; the
// voltage-drop split (brief 1 % vs Cl 3.6.2's 5 %) was verified against the
// standard's own text (Cl 3.6.2 Value) and the brief's source document.
const TARGETS: Target[] = [
  {
    id: "supply",
    name: "Supply",
    value: "500 kVA · 400 V 3-ph",
    detail: "S = 500 kVA · U₀ = 400 V · I_psc = 15 kA. Maximum demand: AS/NZS 3000:2018 Cl 2.2.2(a), Table C2 diversity.",
    hit: { x: "11.7%", y: "7.5%", w: "13.3%", h: "14.0%" },
  },
  {
    id: "mains",
    name: "Consumer mains",
    value: "25 mm² X-90 Cu · Ib 123.6 A",
    detail: "I_b = S / (√3 · U₀); I_b ≤ I_n ≤ I_z with I_z from AS/NZS 3008.1.1:2025 Table 3.8 → Table 3.13 Col 19 (buried trefoil); corrections per Cl 3.4.3.",
    hit: { x: "16.5%", y: "22.5%", w: "6.3%", h: "14.0%" },
  },
  {
    id: "vd",
    name: "Voltage drop",
    value: "ΔV 0.74 % vs 1 % limit",
    detail: "ΔV = √3 · I_b · L · R_c / 1000 ≤ 1 % of 400 V (project brief). AS/NZS 3000:2018 Cl 3.6.2 sets the 5 % installation limit.",
    hit: { x: "35.5%", y: "33.0%", w: "12.5%", h: "5.5%" },
  },
  {
    id: "device",
    name: "Main switchboard",
    value: "125 A Type C · PFC 8.0 kA",
    detail: "I_n = 125 A Type C; I_psc 8.0 kA ≤ 10 kA breaking capacity per Cl 2.5.4.2(a). EFLI: Cl 5.7.3, Table 8.1.",
    hit: { x: "16.5%", y: "36.5%", w: "6.3%", h: "10.0%" },
  },
  {
    id: "sup",
    name: "Supermarket submain",
    value: "SUP-DB · 40 A · 6 mm² V-75",
    detail: "Submain: same chain; Table 3.8 → Table 3.12 Col 17 (one conduit). ΔV adds to the path budget against Cl 3.6.2's 5 %.",
    hit: { x: "43.3%", y: "45.0%", w: "12.5%", h: "37.5%" },
  },
  {
    id: "hai",
    name: "Hairdresser submain",
    value: "HAI-DB · 25 A · 6 mm² V-75",
    detail: "Submain: same chain; Table 3.8 → Table 3.12 Col 17 (one conduit). ΔV adds to the path budget against Cl 3.6.2's 5 %.",
    hit: { x: "61.7%", y: "45.0%", w: "12.1%", h: "37.5%" },
  },
  {
    id: "but",
    name: "Butcher submain",
    value: "BUT-DB · 50 A · 10 mm² V-75",
    detail: "Submain: same chain; Table 3.8 → Table 3.12 Col 17 (one conduit). ΔV adds to the path budget against Cl 3.6.2's 5 %.",
    hit: { x: "79.6%", y: "45.0%", w: "12.5%", h: "37.5%" },
  },
];

export function FeaturedSldInteractive({ svg, plotEnd }: { svg: string; plotEnd: string }) {
  const [active, setActive] = useState<TargetId | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Partial<Record<TargetId, HTMLButtonElement | null>>>({});
  // focus management (R1 finding 2): opening from a row moves focus into the
  // detail (the rows leave the focus tree while a detail is open), and closing
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
    restoreFocus.current = true;
    setActive(null);
  }, []);

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
      row?.focus();
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
          <span className="hero-sld-hits">
            {TARGETS.map((t, i) => (
              <button
                type="button"
                key={t.id}
                className="hero-sld-hit"
                data-target={t.id}
                aria-pressed={active === t.id}
                aria-label={`${t.name}: ${t.value}`}
                style={{ "--x": t.hit.x, "--y": t.hit.y, "--w": t.hit.w, "--h": t.hit.h, "--ping-i": i } as CSSProperties}
                onClick={() => toggle(t.id)}
              />
            ))}
          </span>
        </div>
      </div>
      <div className="hero-sld-panel" style={{ "--plot-end": plotEnd } as CSSProperties}>
        <ul className="hero-sld-rows">
          {TARGETS.map((t, i) => (
            <li key={t.id}>
              <button
                type="button"
                className="hero-sld-row"
                data-target={t.id}
                aria-pressed={active === t.id}
                style={{ "--ping-i": i } as CSSProperties}
                ref={(el) => { rowRefs.current[t.id] = el; }}
                onClick={() => openFromRow(t.id)}
              >
                <span className="hero-sld-row-name">{t.name}</span>
                <span className="hero-sld-row-value">{t.value}</span>
              </button>
            </li>
          ))}
        </ul>
        {TARGETS.map((t) => (
          <div
            className="hero-sld-detail"
            data-target={t.id}
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
  );
}
