import type { ReactNode } from "react";

// Two views of the same design: the normative one-line diagram and an isometric
// installation view. The switch is a radio group of visually hidden inputs, so
// it works without JavaScript and needs no client bundle. Each drawing is
// rendered once by the server; note that the App Router's route payload carries
// a second, escaped copy of the same tree for hydration.

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
      <div className="lv-view-switch" role="radiogroup" aria-label="Drawing views">
        {views.map((view, index) => (
          <label key={view.id} className="lv-view-tab">
            <input
              className="lv-view-radio"
              type="radio"
              name="lv-view"
              id={`lv-view-${view.id}`}
              defaultChecked={index === 0}
            />
            <span>{view.label}</span>
          </label>
        ))}
      </div>
      {views.map((view) => (
        <div key={view.id} className="lv-view-panel" data-view={view.id} id={`lv-view-panel-${view.id}`}>
          {panels[view.id]}
          {view.id === "installation" && (
            <details className="lv-install-detail">
              <summary>Read installation detail</summary>
              <p>Scroll across and down to read the full-size drawing.</p>
              <div className="lv-install-pan" role="region" aria-label="Full-size installation drawing" tabIndex={0}>
                <img src={view.fullHref} width={1440} height={960} alt="Installation cutaway with buried routes, board locations and enlarged trench section A." />
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
