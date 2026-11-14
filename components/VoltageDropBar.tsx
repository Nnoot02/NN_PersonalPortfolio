import { VOLTAGE_DROP_PATH as path } from "@/lib/lv-voltage-drop";

export function VoltageDropBar() {
  return (
    <figure className="vd-bar">
      <div className="vd-bar__track" aria-hidden="true">
        {path.segments.map((s) => (
          <span key={s.id} className="vd-bar__seg" data-vd-segment={s.id} data-vd-value={s.value}
            style={{ width: `${((Number(s.value) / path.limit) * 100).toFixed(1)}%` }} />
        ))}
      </div>
      <dl className="vd-bar__legend">
        {path.segments.map((s) => (
          <div key={s.id} data-vd-legend={s.id}><dt><span className="vd-bar__key" data-vd-key={s.id} aria-hidden="true" />{s.label}</dt><dd>{`${s.value} %`}</dd></div>
        ))}
        <div data-vd-legend="total"><dt>Total</dt><dd>{`${path.total} %`}</dd></div>
        <div data-vd-legend="limit"><dt>Limit</dt><dd>{`${path.limit} %`}</dd></div>
      </dl>
      <figcaption>Worst-case path: consumer mains, butcher submain and the lighting final. 3.0 % of the 5 % AS/NZS 3000 limit.</figcaption>
    </figure>
  );
}
