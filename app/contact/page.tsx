import type { Metadata } from "next";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { CopyEmailButton } from "@/components/CopyEmailButton";
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
      <section className="contact-hero">
        <div className="contact-copy">
          <p className="eyebrow">CONTACT</p>
          <h1>EMAIL WORKS BEST.</h1>
          <p>
            Adelaide-based electrical engineering student open to placements,
            internships, and project conversations—especially around power
            systems, grid integration, and practical electrical engineering.
          </p>
          <div className="contact-actions">
            <a className="button button-primary contact-email" href={`mailto:${profile.contactEmail}`}>
              <EnvelopeSimple size={20} aria-hidden="true" />
              {profile.contactEmail}
            </a>
            <CopyEmailButton email={profile.contactEmail} label="Copy address" variant="secondary" />
          </div>
        </div>
        <aside className="contact-snapshot" aria-labelledby="contact-snapshot-heading">
          <h2 id="contact-snapshot-heading">Technical snapshot</h2>
          <dl className="contact-snapshot-list">
            <div className="contact-snapshot-group">
              <dt>Current role</dt>
              <dd>Production Worker · Tindo Solar</dd>
            </div>
            <div className="contact-snapshot-group">
              <dt>Studying</dt>
              <dd>Associate Degree in Electronics Engineering · TAFE SA</dd>
            </div>
            <div className="contact-snapshot-group">
              <dt>Verified power</dt>
              <dd>
                <ul>
                  <li>
                    <a href="/projects/lv-cabling-design-commercial-complex">
                      400 V commercial LV design <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                  <li>
                    <a href="/projects/solar-grid-connection-assessment">
                      1 MW grid assessment <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                </ul>
              </dd>
            </div>
            <div className="contact-snapshot-group">
              <dt>Current build</dt>
              <dd>
                GPS-denied autonomous UAV
                <br />
                SITL / ROS 2 setup + subsystem validation
              </dd>
            </div>
            <div className="contact-snapshot-group">
              <dt>Path</dt>
              <dd>Commercial kitchens → power systems</dd>
            </div>
          </dl>
        </aside>
      </section>
      <SiteFooter compact />
    </main>
  );
}
