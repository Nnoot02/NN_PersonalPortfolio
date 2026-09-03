"use client";

// This gallery is a client component only because of the lightbox: showModal()
// is script, so opening evidence photos in place costs hydration on every
// workbench detail page. That trade was put to Nathan with the zero-JS
// alternative (a plain new-tab link) and he chose the modal (decision B4).
//
// The dialog is deliberately native. Focus trapping, focus restoration to the
// trigger, Escape-to-close, ::backdrop and background inertness all come from
// the platform; hand-rolling them is the part that goes wrong.
import Image from "next/image";
import { X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import type { WorkbenchEntry } from "@/lib/workbench";

type Evidence = WorkbenchEntry["evidence"][number];

export function WorkbenchEvidenceGallery({ entry }: { entry: WorkbenchEntry }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Evidence | null>(null);

  function openEvidence(item: Evidence) {
    setActive(item);
    dialogRef.current?.showModal();
  }

  return (
    <section className="workbench-evidence" data-workbench-evidence aria-labelledby="workbench-evidence-heading">
      <div className="section-heading"><p className="eyebrow">Owned evidence</p><h2 id="workbench-evidence-heading">At the bench</h2></div>
      <div className="workbench-evidence-grid">
        {entry.evidence.map((item) => (
          <figure key={item.image}>
            <button className="evidence-trigger" type="button" onClick={() => openEvidence(item)}>
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 50vw" />
              <span className="sr-only">View full size: {item.caption}</span>
            </button>
            <figcaption><span>{item.kind}</span>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
      {/* One dialog shared by every figure, not one per figure. */}
      <dialog className="evidence-dialog" ref={dialogRef} aria-label="Evidence photo at full size" onClose={() => setActive(null)}>
        {active ? (
          <>
            {/* A plain img, not next/image: this is the unresized source, and
                the static export serves it as authored. */}
            <img src={active.image} alt={active.alt} />
            <p className="evidence-dialog-caption">{active.caption}</p>
          </>
        ) : null}
        <button className="evidence-dialog-close" type="button" onClick={() => dialogRef.current?.close()}>
          <X size={18} weight="bold" /> <span>Close</span>
        </button>
      </dialog>
    </section>
  );
}
