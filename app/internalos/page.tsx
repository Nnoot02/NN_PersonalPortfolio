import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "InternalOS",
  description:
    "InternalOS is a private, single-user automation system that runs locally and reads Google Calendar and Gmail with read-only access. This page describes the integration.",
};

// The Google Cloud project behind this site owns an OAuth client that InternalOS
// uses for two read-only Google integrations. Google's consent screen asks for a
// homepage that describes the app, so this page is that homepage: what is
// connected, where it runs, and who can use it. The privacy policy it links is
// the other half of the same requirement.
export default function InternalOsPage() {
  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <section className="page-hero">
        <p className="eyebrow">InternalOS</p>
        <h1>Personal tooling.</h1>
        <p>InternalOS is a private, single-user automation system that runs on my own computer in Adelaide. The Google Cloud project behind this portfolio owns the OAuth client it uses, which is why this page exists: it describes the two Google integrations and what they are allowed to read.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="internalos-scope-heading">
        <p className="eyebrow">What it connects to</p>
        <h2 id="internalos-scope-heading">Two Google services, both read-only</h2>
        <ul>
          <li><strong>Google Calendar</strong> (scope "calendar.readonly"): reads the calendar list and the events in the next 14 days, so the Command Centre dashboard on the same machine can show today's agenda and the fortnight ahead.</li>
          <li><strong>Gmail</strong> (scope "gmail.readonly"): reads job-alert email sent by SEEK, so a weekly digest can list new postings worth reviewing.</li>
        </ul>
        <p>Neither integration can create, edit, or delete anything in Calendar or Gmail. Each reads only what its scope allows, and only for the single account that granted access.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="internalos-runs-heading">
        <p className="eyebrow">How it runs</p>
        <h2 id="internalos-runs-heading">Everything stays on one machine</h2>
        <p>OAuth tokens and the cached calendar events are stored as local files on my Windows machine, outside any synced folder. The digest and its seen-list are written to a local project folder. Requests go from that machine straight to Google's APIs over HTTPS. There is no InternalOS server, and no copy of this data is sent anywhere else.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="internalos-users-heading">
        <p className="eyebrow">Who can use it</p>
        <h2 id="internalos-users-heading">One user, not published</h2>
        <p>InternalOS has exactly one user: me. It is not distributed, it has no sign-up, and its OAuth client details are not shared. The consent screen is the only place Google access is granted, and it can be revoked there at any time.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="internalos-contact-heading">
        <p className="eyebrow">Privacy and contact</p>
        <h2 id="internalos-contact-heading">Where to read the details</h2>
        <p>The <Link className="text-link" href="/privacy">privacy policy</Link> sets out what is accessed, how it is used and stored, and how to revoke access.</p>
        <p>Questions about this project can go to <a className="text-link" href="mailto:nathannoott@gmail.com">nathannoott@gmail.com</a>.</p>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
