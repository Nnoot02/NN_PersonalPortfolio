"use client";

import { useId, useRef, useState } from "react";

// Two views of the same design: the normative one-line diagram and an
// isometric installation view. Both are inline SVG so the page owns their
// styling; the inactive panel stays in the DOM but hidden, so switching costs
// no layout and no fetch.

export type DesignView = {
  id: string;
  label: string;
  svg: string;
  caption: string;
  fullHref: string;
};

export function LvDesignViews({ views }: { views: DesignView[] }) {
  const base = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = views.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="lv-views">
      <div className="lv-views-tabs" role="tablist" aria-label="Drawing views">
        {views.map((view, index) => (
          <button
            key={view.id}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${view.id}`}
            aria-controls={`${base}-panel-${view.id}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            className="lv-view-tab"
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {view.label}
          </button>
        ))}
      </div>
      {views.map((view, index) => (
        <div
          key={view.id}
          role="tabpanel"
          id={`${base}-panel-${view.id}`}
          aria-labelledby={`${base}-tab-${view.id}`}
          hidden={index !== active}
          className="lv-view-panel"
        >
          <div className="lv-view-stage" dangerouslySetInnerHTML={{ __html: view.svg }} />
          <p className="lv-view-meta">
            <span>{view.caption}</span>
            <a className="text-link" href={view.fullHref} target="_blank" rel="noopener">
              Open this view full size<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}
