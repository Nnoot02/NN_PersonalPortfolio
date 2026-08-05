import type { Metadata } from "next";
import { EnvelopeSimple, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
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
      <section className="page-hero contact-hero">
        <p className="eyebrow">Contact</p>
        <h1>Let&apos;s talk<br />{" "}about the work.</h1>
        <p>I&apos;m interested in hearing about South Australian student placements and internships, particularly where power systems, grid integration, or practical electrical engineering are part of the work. Broader electrical engineering roles are worth a conversation too.</p>
        <div className="contact-actions">
          <a className="placeholder-contact" href={`mailto:${profile.contactEmail}`}><EnvelopeSimple size={20} /> Email Nathan</a>
          <CopyEmailButton email={profile.contactEmail} />
          {profile.links.linkedin ? <a className="placeholder-contact" href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={20} /> LinkedIn</a> : null}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
