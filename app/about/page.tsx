import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutPhotoMarker } from "@/components/AboutPhotoMarker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolsStandardsNetwork } from "@/components/ToolsStandardsNetwork";

export const metadata: Metadata = {
  title: "About",
  description:
    "Electrical and electronics engineering student in South Australia focused on standards-informed power design, embedded systems, manufacturing experience, and evidence-based engineering.",
};

// Audit 2026-09-24, A2 (Nathan's call): the story runs as a dated timeline,
// dates taken from public/nathan-noot-resume.txt.
const timeline = [
  {
    when: "Aug 2022 to Aug 2025",
    role: "Kitchen supervisor, Plus 82 Pocha",
    body: "When I was appointed kitchen supervisor, I learnt how to coordinate a team of five, train staff, manage stock, and make calm decisions under pressure.",
  },
  {
    when: "Nov 2025 to Aug 2026",
    role: "Production worker, Tindo Solar",
    body: "Moving from comfortable hospitality work onto a solar-panel production line was deliberate, as it keeps me closer to engineering practice. The floor gave me direct exposure to 5S, Kaizen, flash testing, quality checks, and fault-finding culture, and shadowing the engineers showed me how RCA and 8D problem-solving connect engineering decisions with process reliability and operator reality.",
  },
  {
    when: "Aug 2026 to now",
    role: "Electrical engineering intern, Tindo Solar",
    body: "I assist with BOM documentation, component selection, and circuit design under engineering direction, and I write the standard operating procedures, work instructions, and quality records that keep production consistent.",
  },
  {
    when: "Now, final year",
    role: "Associate Degree in Electronics Engineering, TAFE SA",
    body: "I have worked through standards-informed electrical design: cable sizing, protection, grid-connection reasoning, single-line diagrams, wiring schedules, and compliance matrices.",
  },
  {
    when: "Expected 2028",
    role: "Bachelor of Electrical and Electronic Engineering, Adelaide University",
    body: "My current path articulates from TAFE SA into the degree.",
  },
];

export default function AboutPage() {
  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <section className="page-hero page-hero--about">
        <p className="eyebrow">About</p>
        <h1>Solar systems, from grid to factory.</h1>
        <p>I became a chef to help people, then chose engineering to pursue net zero and Australia's energy dominance through solar.</p>
        {/* Audit 2026-09-24, A3 (Nathan's call, photo cleared for release).
            The export is unoptimized, so the <source> carries the srcset. */}
        <figure className="about-hero-photo" data-about-photo>
          <span className="about-hero-photo-frame">
            <picture>
              <source srcSet="/images/about/tindo-team-560.webp 560w, /images/about/tindo-team-936.webp 936w" sizes="(max-width: 720px) calc(100vw - 2.5rem), (max-width: 960px) 640px, 40vw" />
              <Image src="/images/about/tindo-team-936.webp" alt="Nine members of the Tindo Solar team standing together on the factory floor" width={936} height={703} priority />
            </picture>
            <AboutPhotoMarker />
          </span>
          <figcaption>Me (far right) with some of the team at Tindo Solar.</figcaption>
        </figure>
      </section>
      <section className="about-story">
        <div className="about-story-intro">
          <div><p className="eyebrow">Approach</p><h2>Start with constraints.</h2></div>
          <p>Define the requirement, expose the assumptions, build the smallest useful test, then explain what the result means.</p>
        </div>
        <ol className="about-timeline" aria-label="Work and study timeline" data-about-timeline>
          {timeline.map((step) => (
            <li key={step.role}>
              <div>
                <p className="about-timeline-when">{step.when}</p>
                <h3>{step.role}</h3>
              </div>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="about-bench">Outside work and study, I keep building at the <Link className="text-link" href="/workbench">bench</Link>: small systems where limitations stay visible and useful.</p>
      </section>
      <section className="about-tools" id="tools-and-standards" aria-labelledby="tools-and-standards-heading">
        <ToolsStandardsNetwork />
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
