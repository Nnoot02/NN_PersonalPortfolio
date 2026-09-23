import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/projects";
import type { WorkbenchEntry } from "@/lib/workbench";

// 236px centre crops (2x the 118px box) of the same photos: the full-size
// originals cost ~178 KiB on mobile for a 118px square (audit U7). The
// export is unoptimized, so next/image serves src as-is.
const UAV_THUMB = "/images/thumbs/gps-denied-uav-236.webp";
const WORKBENCH_THUMB = "/images/thumbs/bench-fume-extractor-236.webp";

export function HomepageEpilogue({
  uavProject,
  workbenchEntry,
}: {
  uavProject: Project;
  workbenchEntry: WorkbenchEntry;
}) {
  return (
    <section className="homepage-epilogue" data-homepage-epilogue aria-labelledby="homepage-epilogue-heading">
      <div className="homepage-epilogue-context">
        <h2 id="homepage-epilogue-heading">Other systems</h2>
        <Link className="text-link homepage-epilogue-collection" href="/projects">
          View all <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <Link className="homepage-portal" data-homepage-portal="uav" href={`/projects/${uavProject.slug}`}>
        <span className="homepage-portal-image">
          <Image src={UAV_THUMB} alt={uavProject.imageAlt} fill sizes="(max-width: 760px) 92px, 118px" />
        </span>
        <div className="homepage-portal-copy">
          <span className="homepage-portal-status">In progress</span>
          <h3 className="homepage-portal-title">GPS-Denied UAV</h3>
          <p className="homepage-portal-summary">Indoor autonomy and staged verification.</p>
        </div>
        <ArrowRight className="homepage-portal-arrow" size={20} aria-hidden="true" />
      </Link>

      <Link className="homepage-portal" data-homepage-portal="workbench" href="/workbench">
        <span className="homepage-portal-image">
          <Image src={WORKBENCH_THUMB} alt={workbenchEntry.imageAlt} fill sizes="(max-width: 760px) 92px, 118px" />
        </span>
        <div className="homepage-portal-copy">
          <span className="homepage-portal-status">After hours</span>
          <h3 className="homepage-portal-title">Workbench</h3>
          <p className="homepage-portal-summary">Builds, failures, and next iterations.</p>
        </div>
        <ArrowRight className="homepage-portal-arrow" size={20} aria-hidden="true" />
      </Link>
    </section>
  );
}
