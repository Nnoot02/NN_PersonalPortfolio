import type { Project } from "@/lib/projects";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const profile = {
  name: "Nathan No-ot",
  title: "Electrical and electronics engineering student",
  location: "South Australia",
  summary:
    "Electrical and electronics engineering student building public evidence across power systems, embedded systems, controls, UAVs, solar manufacturing, DFMA, and verification.",
  resumePath: "/nathan-noot-general-resume.pdf",
  resumeTextPath: "/nathan-noot-general-resume.txt",
  targetRoles: [
    "Graduate electrical engineer",
    "Power engineering graduate",
    "Defence engineering graduate",
    "Embedded systems or controls graduate",
  ],
  strengths: [
    "Standards-informed power-system design using AS/NZS 3000, AS/NZS 3008, AS/NZS 4777.2, and SAPN TS132/TS133",
    "Embedded systems, UAV, controls, and practical electronics projects",
    "Solar manufacturing exposure through Kaizen, 5S, RCA, and 8D problem-solving",
    "Technical writing, documentation, DFMA, and evidence-based engineering decisions",
  ],
  publicBoundary:
    "Public portfolio content is sanitized. Phone, street address, employer-sensitive process detail, university-restricted material, and defence-related details are omitted unless cleared.",
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
