"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LV_DESIGN_BASIS, type BasisId } from "@/lib/lv-design-basis";

// The installation cutaway's route trace (docs/lv-cutaway-route-trace.md). The
// route draws once, supply to boards, the first time the drawing is seen; the
// five stops then open the design basis behind each part of the route.
// The server frame is the finished drawing: the trace is armed only by JS
// under no-preference motion, so no-JS and reduced-motion readers lose nothing.

type StopId = "supply" | "mains" | "msb" | "submains" | "trench";

// Labels follow the drawing's own callouts (01, 02, 03, A) so a stop can be
// found on the drawing without hit areas over it.
const STOPS: { id: StopId; label: string; rows: BasisId[] }[] = [
  { id: "supply", label: "01 Site supply", rows: ["supply"] },
  { id: "mains", label: "Consumer mains", rows: ["mains", "vd"] },
  { id: "msb", label: "02 Main switchboard", rows: ["device"] },
  { id: "submains", label: "03 Submains", rows: ["sup", "hai", "but"] },
  { id: "trench", label: "A Trench section", rows: ["trench"] },
];

export function LvInstallationTrace({ svg }: { svg: string }) {
  const baseId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<StopId, HTMLButtonElement | null>>>({});
  const [trace, setTrace] = useState<"idle" | "armed" | "play">("idle");
  const [motionOk, setMotionOk] = useState(false);
  const [active, setActive] = useState<StopId | null>(null);

  // memoized: a re-render must not re-set the innerHTML and restart the trace
  const drawing = useMemo(
    () => <div className="lv-view-stage" ref={stageRef} dangerouslySetInnerHTML={{ __html: svg }} />,
    [svg],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    setMotionOk(true);
    setTrace("armed");
    // The panel is display:none until its tab is chosen, so this fires on the
    // tab switch, not on page load.
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setTrace("play");
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      buttonRefs.current[active]?.focus({ preventScroll: true });
      setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  function replay() {
    setTrace("armed");
    // two frames: the armed state must paint before the animation restarts
    requestAnimationFrame(() => requestAnimationFrame(() => setTrace("play")));
  }

  return (
    <div className="lv-trace" data-trace={trace} data-active={active ?? undefined}>
      {drawing}
      {/* Without JS the stops cannot open, so every detail is shown instead. */}
      <noscript><style>{".lv-trace-stops { display: none; } .lv-trace-detail[hidden] { display: block; }"}</style></noscript>
      <ul className="lv-trace-stops" aria-label="Stops on the route">
        {STOPS.map((stop) => (
          <li key={stop.id}>
            <button
              type="button"
              className="lv-trace-stop"
              data-stop={stop.id}
              aria-expanded={active === stop.id}
              aria-controls={`${baseId}-${stop.id}`}
              ref={(el) => { buttonRefs.current[stop.id] = el; }}
              onClick={() => setActive((current) => (current === stop.id ? null : stop.id))}
            >
              {stop.label}
            </button>
          </li>
        ))}
      </ul>
      {motionOk && (
        <button type="button" className="lv-trace-replay text-link" onClick={replay}>
          Replay route
        </button>
      )}
      {STOPS.map((stop) => (
        <div key={stop.id} id={`${baseId}-${stop.id}`} className="lv-trace-detail" data-stop={stop.id} hidden={active !== stop.id}>
          <dl>
            {stop.rows.map((id) => {
              const row = LV_DESIGN_BASIS[id];
              return (
                <div key={id}>
                  <dt>{row.name} <span className="lv-trace-value">{row.value}</span></dt>
                  <dd>{row.detail}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}
