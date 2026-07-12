import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="page-hero">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <p>The page you requested does not exist or has moved. The work is still here.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/">
            Back to home <ArrowRight size={20} />
          </Link>
          <Link className="button button-secondary" href="/projects">
            View projects <ArrowRight size={20} />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
