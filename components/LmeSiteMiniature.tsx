// Last-Metre Eyes site miniature (plan 2026-11-15-003, DESIGN.md miniature
// exception): one illustrative voxel render below the relay figure. Source and
// rerender command: scripts/miniatures/lme-site/README.md. A plain eager <img>:
// the export is unoptimized and the file is a few kB, so the box never measures
// unloaded and print never omits it. CSS scales it by whole multiples only.
export function LmeSiteMiniature() {
  return (
    <figure className="case-miniature" data-miniature="lme-site">
      <img
        src="/images/viasat-entry/site-miniature.png"
        width={320}
        height={224}
        decoding="async"
        alt="Illustrative scene: a drone inside a collapsed building and a relay node on a mast at the site perimeter, linked to a satellite."
      />
      <figcaption>Illustrative, concept not built. The drone works inside the collapsed building; the relay sits at the perimeter, where it has sky view.</figcaption>
    </figure>
  );
}
