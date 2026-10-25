import { FooterDroneStop } from "@/components/FooterDroneStop";
import { FooterNavLink } from "@/components/FooterNavLink";
import { EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/site";

export function SiteFooter({ variant = "default", droneStop = false }: { variant?: "default" | "compact"; droneStop?: boolean }) {
  if (variant === "compact") {
    return (
      <footer className="site-footer site-footer--compact" data-footer-variant="compact">
        <div>
          <p className="footer-summary">NATHAN NO-OT · ADELAIDE, SA</p>
        </div>
        <div className="footer-links">
          <FooterNavLink href="/projects">Projects</FooterNavLink>
          {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={22} aria-hidden="true" /> <span>LinkedIn</span><span className="sr-only"> (opens in a new tab)</span></a> : null}
          {profile.links.github ? <a href={profile.links.github} target="_blank" rel="me noopener"><GithubLogo size={22} aria-hidden="true" /> <span>GitHub</span><span className="sr-only"> (opens in a new tab)</span></a> : null}
          <a href={profile.resumePath} target="_blank" rel="noopener">Résumé<span className="sr-only"> (PDF, opens in a new tab)</span></a>
          <FooterNavLink href="/workbench">Workbench</FooterNavLink>
          <FooterNavLink href="/resume">Résumé overview</FooterNavLink>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer" data-footer-variant="default">
      <div>
        <p className="footer-kicker">Available for South Australian internships.</p>
        <p className="footer-title">Ask me about my work{droneStop ? <FooterDroneStop /> : "."}</p>
        <p className="footer-summary">Nathan No-ot · Electrical engineering student</p>
        <p className="footer-location">Adelaide, South Australia</p>
      </div>
      {/* Audit 2026-09-24, S4: one treatment per group. Ways to reach Nathan
          are boxed actions; site links are text. Fact sheet stays the final
          anchor (portfolio-contract pins it), so append nothing after it. */}
      <div className="footer-links footer-links--grouped">
        <div className="footer-actions" data-footer-group="contact" role="group" aria-label="Contact and résumé">
          <a href={`mailto:${profile.contactEmail}`}><EnvelopeSimple size={22} aria-hidden="true" /> <span>Email</span></a>
          {profile.links.linkedin ? <a href={profile.links.linkedin} target="_blank" rel="me noopener"><LinkedinLogo size={22} aria-hidden="true" /> <span>LinkedIn</span><span className="sr-only"> (opens in a new tab)</span></a> : null}
          {profile.links.github ? <a href={profile.links.github} target="_blank" rel="me noopener"><GithubLogo size={22} aria-hidden="true" /> <span>GitHub</span><span className="sr-only"> (opens in a new tab)</span></a> : null}
          <a href={profile.resumePath} target="_blank" rel="noopener">Résumé<span className="sr-only"> (PDF, opens in a new tab)</span></a>
        </div>
        <nav className="footer-site" data-footer-group="site" aria-label="Footer">
          <FooterNavLink href="/contact">Contact</FooterNavLink>
          <FooterNavLink href="/projects">Projects</FooterNavLink>
          <FooterNavLink href="/workbench">Workbench</FooterNavLink>
          <FooterNavLink href="/resume">Résumé overview</FooterNavLink>
          <a href={profile.resumeTextPath}>Plain-text résumé</a>
          <FooterNavLink data-footer-utility href="/profile">Fact sheet</FooterNavLink>
        </nav>
      </div>
    </footer>
  );
}
