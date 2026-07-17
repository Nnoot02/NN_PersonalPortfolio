import Link from "next/link";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">Available for student and internship opportunities</p>
        <p className="footer-title">Nathan No-ot</p>
        <p className="footer-summary">I focus on solar power systems and grid integration as an electrical engineering student.</p>
        <p className="footer-location">Adelaide, South Australia</p>
      </div>
      <div className="footer-links">
        <a href={`mailto:${profile.contactEmail}`}>Email</a>
        {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={22} /> <span>LinkedIn</span></a> : null}
        <a href={profile.resumePath} download>Résumé</a>
        <Link href="/workbench">Workbench</Link>
        <Link href="/projects">Projects</Link>
        <Link className="footer-utility" data-footer-utility href="/profile">Recruiter / AI brief</Link>
      </div>
    </footer>
  );
}
