import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkbenchEvidenceGallery } from "@/components/WorkbenchEvidenceGallery";
import { getWorkbenchEntry, workbenchEntries } from "@/lib/workbench";

type WorkbenchParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return workbenchEntries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: WorkbenchParams): Promise<Metadata> {
  const entry = getWorkbenchEntry((await params).slug);
  return entry ? { title: entry.title, description: entry.summary, keywords: entry.tags, openGraph: { title: entry.title, description: entry.summary, type: "article", url: `/workbench/${entry.slug}`, images: [{ url: entry.image, alt: entry.imageAlt }] } } : {};
}

export default async function WorkbenchDetailPage({ params }: WorkbenchParams) {
  const entry = getWorkbenchEntry((await params).slug);
  if (!entry) notFound();
  const source = "source" in entry ? entry.source : undefined;

  return (
    <main id="main-content">
      <SiteHeader />
      <article className="workbench-detail" data-workbench-entry={entry.slug} data-requires-source={source ? "true" : undefined}>
        <Link className="back-link" href="/workbench"><ArrowLeft size={18} /> Workbench</Link>
        <p className="eyebrow" data-build-type>{entry.buildType}</p>
        <h1>{entry.title}</h1>
        <p className="case-lede">{entry.summary}</p>
        {source ? <aside className="workbench-attribution" data-source-attribution><p className="eyebrow">Original source</p><p><a href={source.canonicalUrl} target="_blank" rel="noreferrer">{source.sourceName}{source.creator ? ` by ${source.creator}` : ""} <ArrowUpRight size={17} /></a></p><p>{source.rightsNote}</p></aside> : null}
        <dl className="workbench-reflection" data-workbench-reflection>
          <div><dt>Why I built it</dt><dd>{entry.motivation}</dd></div>
          <div><dt>My contribution</dt><dd>{entry.contribution}</dd></div>
          <div><dt>Main constraint</dt><dd>{entry.constraint}</dd></div>
          <div><dt>Observed result</dt><dd>{entry.observedOutcome}</dd></div>
          <div><dt>What fell short</dt><dd>{entry.failure}</dd></div>
          <div><dt>Next iteration</dt><dd>{entry.nextIteration}</dd></div>
        </dl>
        <WorkbenchEvidenceGallery entry={entry} />
      </article>
      <SiteFooter />
    </main>
  );
}
