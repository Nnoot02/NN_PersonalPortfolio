import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How InternalOS accesses, uses, stores, and deletes Google user data: read-only Calendar and Gmail access, local storage, no sharing, and the Limited Use disclosure.",
};

// This page is the privacy policy URL on the Google Cloud project's OAuth
// branding page, so it has to carry the disclosures Google's OAuth policy
// requires: what is accessed, how it is used and stored, with whom it is
// shared, how it is deleted, and the Limited Use statement. scripts/
// portfolio-contract.mjs pins those disclosures so they cannot quietly leave.
export default function PrivacyPage() {
  return (
    <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <section className="page-hero">
        <p className="eyebrow">Privacy policy</p>
        <h1>Privacy policy.</h1>
        <p>How InternalOS, including its Command Centre dashboard, accesses, uses, stores, and deletes Google user data. Last updated 23 September 2026.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-scope-heading">
        <p className="eyebrow">Scope</p>
        <h2 id="privacy-scope-heading">What this policy covers</h2>
        <p>This policy covers InternalOS, a private automation system run by the owner of this site on his own computer, and the Google OAuth client registered to the Google Cloud project behind this domain. It applies to data read through Google APIs on behalf of one account, nathannoott@gmail.com, which belongs to that same owner.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-data-heading">
        <p className="eyebrow">Data accessed</p>
        <h2 id="privacy-data-heading">Google user data this project reads</h2>
        <ul>
          <li><strong>Google Calendar</strong> (scope "calendar.readonly"): the list of calendars on the account, and the events in the next 14 days, including titles, start and end times, locations, and links to the events.</li>
          <li><strong>Gmail</strong> (scope "gmail.readonly"): job-alert messages sent by SEEK, matched by sender and subject, read to extract the posting details used in a weekly digest.</li>
        </ul>
        <p>Nothing else in the account is read, and no other Google service is accessed. Both scopes are read-only: the project cannot create, edit, or delete calendar events or email.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-use-heading">
        <p className="eyebrow">Use</p>
        <h2 id="privacy-use-heading">How the data is used</h2>
        <p>The calendar data is used only to show the agenda on a local dashboard. The Gmail data is used only to build the weekly job-alert digest. Both features serve the account owner alone, and the data is not used for anything else.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-storage-heading">
        <p className="eyebrow">Storage</p>
        <h2 id="privacy-storage-heading">Where the data is stored</h2>
        <p>OAuth tokens and the cached calendar events are stored as local files on the owner&rsquo;s Windows machine, in application data outside any synced folder. Alert emails are parsed by a local script on that same machine, and the digest and its seen-list are written to a local project folder. No Google user data is stored on a server or in the cloud.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-limits-heading">
        <p className="eyebrow">Limits</p>
        <h2 id="privacy-limits-heading">What is never done</h2>
        <ul>
          <li>Google user data is not sold, rented, or shared with any third party.</li>
          <li>It is not used for advertising, profiling, or analytics.</li>
          <li>It is not used to train or improve machine-learning models.</li>
          <li>No one other than the account owner reads it, and no other person has access to the machine that stores it.</li>
          <li>It is not transferred for any purpose other than the features described above.</li>
        </ul>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-retention-heading">
        <p className="eyebrow">Retention and deletion</p>
        <h2 id="privacy-retention-heading">Keeping it, removing it</h2>
        <p>Data is kept only while the integration is in use. Access can be revoked at any time from the Google Account permissions page at <a className="text-link" href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">myaccount.google.com<span className="sr-only"> (opens in a new tab)</span></a>, which stops every further read and leaves the app with no way to reach the account. Deleting the local token and cache files removes the stored copies; a deletion request can also be sent to the contact address below.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-limited-use-heading">
        <p className="eyebrow">Limited Use</p>
        <h2 id="privacy-limited-use-heading">Limited Use disclosure</h2>
        <p>The use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-security-heading">
        <p className="eyebrow">Security</p>
        <h2 id="privacy-security-heading">How the data is protected</h2>
        <p>Tokens are kept on the local machine, outside synced folders, and every request travels over HTTPS to Google&rsquo;s APIs. Only the account owner has access to that machine and to the files it holds.</p>
      </section>
      <section className="disclosure-panel" aria-labelledby="privacy-changes-heading">
        <p className="eyebrow">Changes and contact</p>
        <h2 id="privacy-changes-heading">Changes to this policy</h2>
        <p>If this policy changes, the date at the top of the page changes with it. Questions about this policy can go to <a className="text-link" href="mailto:nathannoott@gmail.com">nathannoott@gmail.com</a>.</p>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
