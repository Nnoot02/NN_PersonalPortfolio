"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

// A drawing whose route draws once, the first time it is seen, then offers
// stops that open the design basis behind each part of it. Used by the LV
// installation cutaway (docs/lv-cutaway-route-trace.md) and the solar
// single-line concept (docs/solar-connection-trace.md). The drawing supplies
// <g data-stop> groups and .drawing-trace-reveal mask copies; nothing here is
// specific to either drawing.
// The server frame is the finished drawing: the trace is armed only by JS
// under no-preference motion, so no-JS and reduced-motion readers lose nothing.

export type TraceRow = { name: string; value: string; detail: string };
export type TraceStop = { id: string; label: string; rows: TraceRow[] };

export function DrawingTrace({
  svg,
  stops,
  stopsLabel = "Stops on the route",
  stageClassName = "drawing-trace-stage",
  afterStage,
}: {
  svg: string;
  stops: TraceStop[];
  stopsLabel?: string;
  stageClassName?: string;
  // drawing-specific content shown under the drawing, before the stops
  afterStage?: ReactNode;
}) {
  const baseId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  const [trace, setTrace] = useState<"idle" | "armed" | "play">("idle");
  const [motionOk, setMotionOk] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // memoized: a re-render must not re-set the innerHTML and restart the trace
  const drawing = useMemo(
    () => <div className={stageClassName} ref={stageRef} dangerouslySetInnerHTML={{ __html: svg }} />,
    [svg, stageClassName],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    setMotionOk(true);
    setTrace("armed");
    // Plays when half the drawing is in view; inside a tab panel that is
    // display:none until chosen, that is the tab switch, not page load.
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setTrace("play");
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The chosen stop's group keeps full strength; CSS fades the rest.
  useEffect(() => {
    stageRef.current?.querySelectorAll("[data-stop]").forEach((group) => {
      group.toggleAttribute("data-on", group.getAttribute("data-stop") === active);
    });
  }, [active]);

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
    <div className="drawing-trace" data-trace={trace} data-active={active ?? undefined}>
      {drawing}
      {afterStage}
      {/* Without JS the stops cannot open, so every detail is shown instead. */}
      <noscript><style>{".drawing-trace-stops { display: none; } .drawing-trace-detail[hidden] { display: block; }"}</style></noscript>
      <ul className="drawing-trace-stops" aria-label={stopsLabel}>
        {stops.map((stop) => (
          <li key={stop.id}>
            <button
              type="button"
              className="drawing-trace-stop"
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
        <button type="button" className="drawing-trace-replay text-link" onClick={replay}>
          Replay route
        </button>
      )}
      {stops.map((stop) => (
        <div key={stop.id} id={`${baseId}-${stop.id}`} className="drawing-trace-detail" data-stop={stop.id} hidden={active !== stop.id}>
          <dl>
            {stop.rows.map((row) => (
              <div key={row.name}>
                <dt>{row.name} <span className="drawing-trace-value">{row.value}</span></dt>
                <dd>{row.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
