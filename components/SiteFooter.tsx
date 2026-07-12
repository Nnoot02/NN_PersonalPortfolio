import Link from "next/link";
import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">Available for graduate roles</p>
        <p className="footer-title">Build evidence. Explain decisions. Improve systems.</p>
      </div>
      <div className="footer-links">
        <Link href="/contact">Contact</Link>
        <Link href="/profile">Recruiter / AI brief</Link>
        {profile.links.linkedin ? (
          <a href={profile.links.linkedin} target="_blank" rel="me noopener" aria-label="LinkedIn profile">
            <LinkedinLogo size={22} />
          </a>
        ) : null}
        {profile.links.github ? (
          <a href={profile.links.github} target="_blank" rel="me noopener" aria-label="GitHub profile">
            <GithubLogo size={22} />
          </a>
        ) : null}
      </div>
    </footer>
  );
}
