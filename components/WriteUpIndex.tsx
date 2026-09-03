// Section index for the long case-study write-ups. Not sticky, deliberately:
// .site-header is already position: sticky, and a second sticky bar would stack
// roughly 120px of persistent chrome on a phone. DESIGN.md also draws the
// layout with 1px rules rather than boxes or cards, so a pill-bar sub-nav would
// be a vocabulary the system does not have.
//
// The ids these link to are public URL fragments: once shipped they do not
// change, so a reviewer can be sent straight to one calculation. The contract
// pins them.
export type WriteUpSection = { id: string; label: string };

export function WriteUpIndex({ sections, label }: { sections: WriteUpSection[]; label: string }) {
  return (
    <nav className="writeup-index" aria-label={label}>
      <ol>
        {sections.map((section) => (
          <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
        ))}
      </ol>
    </nav>
  );
}
