import type { Metadata } from "next";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Email is the public contact path for student and internship conversations with Nathan, an electrical engineering student in Adelaide focused on solar power systems and grid integration.",
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero contact-hero contact-hero--compact">
        <div className="contact-layout">
          <div className="contact-column">
            <p className="eyebrow">CONTACT</p>
            <h1>EMAIL WORKS BEST.</h1>
            <div className="contact-details" data-contact-details>
              <p className="contact-intro">Adelaide-based electrical engineering student open to placements, internships, and project conversations, especially around power systems, grid integration, and practical electrical engineering.</p>
              <div className="contact-actions">
                <a className="button button-primary contact-email-link" href={"mailto:" + profile.contactEmail}>
                  <EnvelopeSimple size={20} /> {profile.contactEmail}
                </a>
                <CopyEmailButton email={profile.contactEmail} />
              </div>
            </div>
          </div>
          <aside className="technical-snapshot" data-technical-snapshot aria-labelledby="technical-snapshot-heading">
            <div className="technical-snapshot-heading">
              <h2 id="technical-snapshot-heading">TECHNICAL SNAPSHOT</h2>
            </div>
            <div className="technical-snapshot-group" data-snapshot-group="current-role">
              <p className="technical-snapshot-label">CURRENT ROLE</p>
              <p className="technical-snapshot-value">Electrical Engineering Intern · Tindo Solar</p>
            </div>
            <div className="technical-snapshot-group" data-snapshot-group="studying">
              <p className="technical-snapshot-label">STUDYING</p>
              <p className="technical-snapshot-value">Associate Degree in Electronics Engineering · TAFE SA</p>
            </div>
            <div className="technical-snapshot-group technical-snapshot-group--verified" data-snapshot-group="verified-power">
              <p className="technical-snapshot-label">VERIFIED POWER</p>
              <div className="technical-snapshot-links">
                <Link data-contact-verified-link href="/projects/lv-cabling-design-commercial-complex">400 V commercial LV design ↗</Link>
                <Link data-contact-verified-link href="/projects/solar-grid-connection-assessment">1 MW grid assessment ↗</Link>
              </div>
            </div>
            <div className="technical-snapshot-group" data-snapshot-group="current-build">
              <p className="technical-snapshot-label">CURRENT BUILD</p>
              <p className="technical-snapshot-value">GPS-denied autonomous UAV</p>
              <p className="technical-snapshot-supporting">SITL / ROS 2 setup + subsystem validation</p>
            </div>
            <div className="technical-snapshot-group" data-snapshot-group="path">
              <p className="technical-snapshot-label">PATH</p>
              <p className="technical-snapshot-value">Commercial kitchens → power systems</p>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter variant="compact" />
    </main>
  );
}
