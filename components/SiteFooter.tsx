import Link from "next/link";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/site";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="site-footer site-footer--compact">
        <p className="footer-compact-identity">NATHAN NO-OT · ADELAIDE, SA</p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/projects">Projects</Link>
          {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener">LinkedIn</a> : null}
          <a href={profile.resumePath} download>Résumé</a>
          <Link href="/workbench">Workbench</Link>
        </nav>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">Available for South Australian internships.</p>
        <p className="footer-title">Build power infrastructure with me.</p>
        <p className="footer-summary">Nathan No-ot · Electrical engineering student</p>
        <p className="footer-location">Adelaide, South Australia</p>
      </div>
      <div className="footer-links">
        <Link href="/contact">Contact</Link>
        {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={22} /> <span>LinkedIn</span></a> : null}
        <a href={profile.resumePath} download>Résumé</a>
        <Link href="/projects">Projects</Link>
        <Link href="/workbench">Workbench</Link>
        <Link className="footer-utility" data-footer-utility href="/profile">Recruiter / AI brief</Link>
      </div>
    </footer>
  );
}
