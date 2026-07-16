import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkbenchEntryPreview } from "@/components/WorkbenchEntryPreview";
import { workbenchEntries } from "@/lib/workbench";

export const metadata: Metadata = {
  title: "Workbench",
  description: "Personal engineering bench builds, labelled with authorship, evidence, limitations, and next iterations.",
};

export default function WorkbenchPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero workbench-hero">
        <p className="eyebrow">Personal benchwork</p>
        <h1>Workbench.</h1>
        <p>I spend a lot of spare time at my bench building things, partly to learn and partly because physical work helps me reset. Some builds are mine from the first sketch, while others follow or adapt someone else&apos;s design; they are labelled as such. This section is a collection of what I made, where I failed, and what I would change next.</p>
      </section>
      <section className="featured workbench-collection" data-workbench-collection aria-label="Workbench builds">
        <div className="workbench-list">
          {workbenchEntries.map((entry) => <WorkbenchEntryPreview entry={entry} key={entry.slug} />)}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
