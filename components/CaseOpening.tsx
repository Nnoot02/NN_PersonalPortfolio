// Case-study opening (site screening audit 2026-09-16, F3): contribution,
// outcome and limits stated before the spec strip and the write-up, so the
// first viewport answers "what did Nathan do, and what came of it". Every
// line is drawn from lib/projects.ts -- no new claims, only earlier order.
type CaseOpeningLink = { label: string; href: string };

type CaseOpeningProps = {
  role: string;
  outcome: string;
  limitation: string;
  links: CaseOpeningLink[];
};

export function CaseOpening({ role, outcome, limitation, links }: CaseOpeningProps) {
  return (
    <section className="case-opening" aria-label="Contribution, outcome and limits">
      <dl>
        <div><dt>My contribution</dt><dd>{role}</dd></div>
        <div><dt>Outcome so far</dt><dd>{outcome}</dd></div>
        <div><dt>Where it stops</dt><dd>{limitation}</dd></div>
      </dl>
      {links.length > 0 ? (
        <p className="case-opening-links">
          <span className="eyebrow">In the write-up</span>
          {links.map((link) => (
            <a key={link.href} className="text-link" href={link.href}>{link.label}</a>
          ))}
        </p>
      ) : null}
    </section>
  );
}
