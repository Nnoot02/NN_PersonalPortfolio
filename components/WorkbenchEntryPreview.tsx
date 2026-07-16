import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { WorkbenchEntry } from "@/lib/workbench";

export function WorkbenchEntryPreview({ entry, headingLevel: Heading = "h2" }: { entry: WorkbenchEntry; headingLevel?: "h2" | "h3" }) {
  const source = "source" in entry ? entry.source : undefined;

  return (
    <article className="workbench-preview" data-workbench-entry={entry.slug} data-requires-source={source ? "true" : undefined}>
      <div className="workbench-preview-image"><Image src={entry.image} alt={entry.imageAlt} fill sizes="(max-width: 720px) 100vw, 50vw" /></div>
      <div className="workbench-preview-copy">
        <p className="eyebrow" data-build-type>{entry.buildType}</p>
        <Heading><Link className="workbench-preview-link" href={`/workbench/${entry.slug}`}>{entry.title}</Link></Heading>
        <p>{entry.summary}</p>
        {source ? <p className="workbench-source-credit">Source: {source.creator ?? source.sourceName}</p> : null}
        <span className="row-action" aria-hidden="true">Build notes <ArrowRight size={20} /></span>
      </div>
    </article>
  );
}
