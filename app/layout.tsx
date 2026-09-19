import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";
import { personStructuredData, profile, sharedOpenGraph, siteUrl } from "@/lib/site";
import { bingSiteVerification, cloudflareBeaconToken, googleSiteVerification } from "@/lib/seo-verification";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nathan No-ot | Solar Power Systems Portfolio",
    template: "%s | Nathan No-ot - Solar Power Systems",
  },
  description: profile.summary,
  keywords: [
    "electrical engineering portfolio",
    "Adelaide electrical engineering student",
    "power systems",
    "solar power systems",
    "grid integration",
    "embedded systems",
    "control systems",
    "GPS-denied UAV",
    "DFMA",
  ],
  // Search-engine ownership proof (Objective 1, 2026-09-19). Both codes are
  // pasted into lib/seo-verification.ts and empty until then; Next skips empty
  // values rather than shipping a blank content attribute. Rendered on every
  // route, the homepage included -- that is the URL Google's meta-tag
  // verification and Bing's meta tag check.
  verification: {
    google: googleSiteVerification || undefined,
    other: bingSiteVerification ? { "msvalidate.01": bingSiteVerification } : undefined,
  },
  // "./" resolves against the current route. A literal "/" would make every
  // page claim the homepage as its canonical and its og:url.
  alternates: { canonical: "./" },
  // Inherited by every route that does not declare its own openGraph.
  // "website" is correct for /about, /contact, /projects and the rest;
  // the homepage overrides it to "profile" in app/page.tsx.
  openGraph: { ...sharedOpenGraph, type: "website" },
  // Only the card type is pinned here. Stating title, description and images
  // literally made every detail page advertise the site default on X instead
  // of its own heading; Next resolves those per page from the page's title,
  // description and openGraph images when they are omitted.
  twitter: { card: "summary_large_image" },
};

// themeColor is --paper. colorScheme: light stops dark-mode operating systems
// painting dark scrollbars and form controls over a light page.
export const viewport: Viewport = { themeColor: "#f3f0e9", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
        />
        {children}
        {/* Cloudflare Web Analytics: cookie-free, first-party, and loaded only
            once a token is pasted into lib/seo-verification.ts. `defer` rather
            than a hydration-managed script keeps it out of the React tree. */}
        {cloudflareBeaconToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cloudflareBeaconToken })}
          />
        ) : null}
      </body>
    </html>
  );
}
