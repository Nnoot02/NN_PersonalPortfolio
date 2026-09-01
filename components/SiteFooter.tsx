import Link from "next/link";
import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/site";

export function SiteFooter({ variant = "default" }: { variant?: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <footer className="site-footer site-footer--compact" data-footer-variant="compact">
        <div>
          <p className="footer-summary">NATHAN NO-OT · ADELAIDE, SA</p>
        </div>
        <div className="footer-links">
          <Link href="/projects">Projects</Link>
          {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={22} /> <span>LinkedIn</span></a> : null}
          <a href={profile.resumePath} target="_blank" rel="noopener">Résumé</a>
          <Link href="/workbench">Workbench</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer" data-footer-variant="default">
      <div>
        <p className="footer-kicker">Available for South Australian internships.</p>
        <p className="footer-title">Ask me about my work.</p>
        <p className="footer-summary">Nathan No-ot · Electrical engineering student</p>
        <p className="footer-location">Adelaide, South Australia</p>
      </div>
      <div className="footer-links">
        <Link href="/contact">Contact</Link>
        {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={22} /> <span>LinkedIn</span></a> : null}
        {profile.links.github ? <a href={profile.links.github} target="_blank" rel="me noopener"><GithubLogo size={22} /> <span>GitHub</span></a> : null}
        <a href={profile.resumePath} target="_blank" rel="noopener">Résumé</a>
        <Link href="/projects">Projects</Link>
        <Link href="/workbench">Workbench</Link>
        <Link className="footer-utility" data-footer-utility href="/profile">Fact sheet</Link>
      </div>
    </footer>
  );
}
