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
      <section className="page-hero contact-hero">
        <p className="eyebrow">Contact</p>
        <h1>Let&apos;s discuss<br />{" "}engineering work.</h1>
        <p>Email me about student placements, internships, projects, or mentoring. Solar power systems and grid integration come first; broader electrical engineering work is welcome.</p>
        <div className="contact-actions">
          <CopyEmailButton email={profile.contactEmail} />
          <a className="placeholder-contact" href={`mailto:${profile.contactEmail}`}><EnvelopeSimple size={20} /> {profile.contactEmail}</a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
