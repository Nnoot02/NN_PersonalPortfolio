import Image from "next/image";
import type { WorkbenchEntry } from "@/lib/workbench";

export function WorkbenchEvidenceGallery({ entry }: { entry: WorkbenchEntry }) {
  return (
    <section className="workbench-evidence" data-workbench-evidence aria-labelledby="workbench-evidence-heading">
      <div className="section-heading"><p className="eyebrow">Owned evidence</p><h2 id="workbench-evidence-heading">At the bench</h2></div>
      <div className="workbench-evidence-grid">
        {entry.evidence.map((item) => (
          <figure key={item.image}>
            <div><Image src={item.image} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 50vw" /></div>
            <figcaption><span>{item.kind}</span>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
