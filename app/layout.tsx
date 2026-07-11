import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";
import { personStructuredData, profile, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nathan | Electrical Engineering Portfolio",
    template: "%s | Nathan Engineering Portfolio",
  },
  description: profile.summary,
  keywords: [
    "electrical engineering portfolio",
    "South Australia graduate engineer",
    "power systems",
    "embedded systems",
    "control systems",
    "GPS-denied UAV",
    "DFMA",
  ],
  openGraph: {
    title: "Nathan | Electrical Engineering Portfolio",
    description: profile.summary,
    type: "profile",
    url: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
