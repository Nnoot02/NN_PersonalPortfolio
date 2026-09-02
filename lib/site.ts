import type { Project } from "@/lib/projects";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

// Production builds must be given the real origin. Without this guard an unset
// variable silently ships http://localhost:3000 into og:url, sitemap.xml,
// robots.txt and the Person JSON-LD. The localhost default is for next dev only.
if (!configuredSiteUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    'NEXT_PUBLIC_SITE_URL must be set for a production build. Example: $env:NEXT_PUBLIC_SITE_URL = "https://nnoott.com"',
  );
}

export const siteUrl = configuredSiteUrl || "http://localhost:3000";

export const profile = {
  name: "Nathan No-ot",
  title: "Electrical engineering student focused on solar power systems and grid integration",
  location: "Adelaide, South Australia",
  summary:
    "Electrical engineering student in Adelaide focused on solar power systems and grid integration, with verified standards-based power design and Australian solar manufacturing experience.",
  resumePath: "/nathan-noot-resume.pdf",
  resumeTextPath: "/nathan-noot-resume.txt",
  targetRoles: [
    "Electrical engineering student placement",
    "Power systems internship",
    "Solar and grid-integration internship",
    "Electrical engineering student opportunity",
  ],
  strengths: [
    "Standards-informed power-system design using AS/NZS 3000, AS/NZS 3008, AS/NZS 4777.2, and SAPN TS132/TS133",
    "Solar manufacturing experience in a Kaizen and 5S production culture",
    "Broader systems work across embedded systems, UAVs, controls, and practical electronics",
    "Technical writing, documentation, DFMA, and evidence-based engineering decisions",
  ],
  publicBoundary:
    "Public portfolio content is sanitised. Phone, street address, employer-sensitive process detail, university-restricted material, and defence-related details are omitted unless cleared.",
  contactEmail: "nathannoott@gmail.com",
  links: {
    // Footer links and Person JSON-LD sameAs render only when a URL is non-empty.
    linkedin: "https://www.linkedin.com/in/nnoot/",
    github: "https://github.com/Nnoot02",
  },
};

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  address: {
    "@type": "PostalAddress",
    addressRegion: "South Australia",
    addressCountry: "AU",
  },
  description: profile.summary,
  email: profile.contactEmail,
  knowsAbout: [
    "Electrical engineering",
    "Power systems",
    "Embedded systems",
    "Control systems",
    "GPS-denied UAVs",
    "Design for manufacture and assembly",
    "Verification",
  ],
  seeks: profile.targetRoles.join(", "),
  url: absoluteUrl("/"),
  sameAs: [profile.links.linkedin, profile.links.github].filter(Boolean),
};

export function projectStructuredData(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    about: project.tags,
    keywords: project.tags.join(", "),
    creator: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.title,
      address: {
        "@type": "PostalAddress",
        addressRegion: "South Australia",
        addressCountry: "AU",
      },
    },
  };
}

// Every key an inherited page and the homepage share. Next replaces a child
// route's openGraph object wholesale rather than merging it into the parent,
// so a page that overrides even one key must restate all of them. Spread this
// instead of copying the literals: two copies drift and nothing catches it.
// Only `type` differs between the root layout and the homepage.
export const sharedOpenGraph = {
  title: "Nathan No-ot | Solar Power Systems Portfolio",
  description: profile.summary,
  url: "./",
  siteName: "Nathan No-ot",
  locale: "en_AU",
  images: [
    {
      url: "/images/og-card.png",
      width: 1200,
      height: 630,
      alt: "Nathan No-ot, electrical engineering student in Adelaide - power systems and grid integration",
    },
  ],
};
