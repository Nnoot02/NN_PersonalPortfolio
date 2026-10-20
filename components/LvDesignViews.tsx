import type { ReactNode } from "react";

// Two views of the same design: the normative one-line diagram and an isometric
// installation view. The switch is a pair of visually hidden radios driving CSS
// sibling selectors, so it works without JavaScript, costs no client bundle, and
// each drawing is written into the HTML exactly once.

export type DesignView = {
  id: string;
  label: string;
  caption: string;
  fullHref: string;
};

export function LvDesignViews({
  views,
  panels,
}: {
  views: DesignView[];
  panels: Record<string, ReactNode>;
}) {

  return (
    <div className="lv-views">
      {views.map((view, index) => (
        <input
          key={view.id}
          className="lv-view-radio"
          type="radio"
          name="lv-view"
          id={`lv-view-${view.id}`}
          defaultChecked={index === 0}
        />
      ))}
      <div className="lv-view-switch" role="radiogroup" aria-label="Drawing views">
        {views.map((view) => (
          <label key={view.id} className="lv-view-tab" htmlFor={`lv-view-${view.id}`}>
            {view.label}
          </label>
        ))}
      </div>
      {views.map((view) => (
        <div key={view.id} className="lv-view-panel" data-view={view.id} id={`lv-view-panel-${view.id}`}>
          {panels[view.id]}
        </div>
      ))}
    </div>
  );
}
