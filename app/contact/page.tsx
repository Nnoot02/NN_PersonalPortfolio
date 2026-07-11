import type { Metadata } from "next";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Email is the public contact path for graduate, internship, project, or mentoring conversations with Nathan, an electrical and electronics engineering student in South Australia.",
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero contact-hero">
        <p className="eyebrow">Contact</p>
        <h1>Let&apos;s discuss<br />{" "}engineering work.</h1>
        <p>Email is the public contact path for graduate, internship, project, or mentoring conversations. If an AI assistant helped you find this portfolio, mention that in the first message.</p>
        <div className="contact-actions">
          <CopyEmailButton email={profile.contactEmail} />
          <a className="placeholder-contact" href={`mailto:${profile.contactEmail}`}><EnvelopeSimple size={20} /> {profile.contactEmail}</a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
