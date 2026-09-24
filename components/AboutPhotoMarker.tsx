// Hand-drawn "me" marker over the About team photo (Nathan, 2026-09-24:
// loop + arrow, "me", burnt-orange accent, draws in once). Coordinates are in
// the photo's own 936x703 space, so the SVG scales with the image. The paths
// were generated once with a seeded wobble (after Kevin Ngo's pen-line work:
// seeded jitter, a second pen pass, drawn stroke by stroke) and are fixed here,
// so every build draws the same marks. The caption carries the meaning, so the
// drawing is aria-hidden.
const strokes = [
  { part: "loop", d: "M782.6 206.4 Q797.5 197.6 807.2 196.8 Q816.9 196.0 825.3 196.3 Q833.7 196.5 841.6 201.3 Q849.4 206.1 856.2 211.2 Q863.0 216.3 869.2 225.4 Q875.5 234.5 878.2 244.8 Q880.9 255.1 879.6 264.4 Q878.3 273.7 875.4 282.9 Q872.6 292.1 867.9 300.4 Q863.3 308.8 856.2 312.9 Q849.0 316.9 841.4 321.2 Q833.7 325.4 824.7 327.3 Q815.8 329.1 805.6 326.9 Q795.5 324.7 786.9 319.1 Q778.3 313.5 773.3 305.6 Q768.4 297.6 762.6 290.1 Q756.8 282.6 757.3 273.3 Q757.8 264.0 758.5 254.8 Q759.2 245.6 762.6 236.3 Q766.1 226.9 770.9 219.1 Q775.6 211.2 784.5 207.2 L793.3 203.2", delay: 0, duration: 0.7 },
  { part: "loop-second-pass", d: "M797.9 195.5 Q810.4 188.7 818.7 189.7 Q827.0 190.8 834.6 194.7 Q842.1 198.6 850.4 203.4 Q858.7 208.1 864.4 214.9 Q870.2 221.7 873.5 232.0 Q876.8 242.3 877.5 251.9 Q878.1 261.5 876.7 270.8 Q875.2 280.0 872.5 290.2 Q869.7 300.3 864.9 306.7 Q860.0 313.1 851.5 319.2 Q843.0 325.3 834.8 327.9 Q826.7 330.6 819.0 329.5 Q811.4 328.4 803.3 324.7 Q795.2 321.0 788.3 316.8 Q781.5 312.6 776.8 303.9 Q772.1 295.2 768.9 286.8 Q765.6 278.4 763.4 268.9 Q761.2 259.3 761.8 249.6 Q762.5 240.0 766.5 230.8 Q770.6 221.6 775.8 215.1 Q781.0 208.6 789.7 203.2 L798.4 197.9", delay: 0.55, duration: 0.5, secondPass: true },
  { part: "label", d: "M690.0 102.2 Q691.8 85.3 693.7 79.3 Q695.5 73.3 698.5 71.6 Q701.4 69.9 704.3 72.4 Q707.1 74.9 707.9 82.0 Q708.7 89.0 708.6 95.7 Q708.6 102.4 708.8 93.6 Q708.9 84.8 711.2 78.9 Q713.4 73.0 716.9 71.4 Q720.5 69.8 723.1 72.2 Q725.8 74.6 726.7 81.6 Q727.5 88.7 728.3 94.8 Q729.0 100.9 732.6 100.0 Q736.3 99.1 741.1 96.5 Q745.9 93.8 750.1 91.0 Q754.3 88.1 754.6 84.4 Q754.9 80.7 751.2 78.5 Q747.6 76.3 743.6 78.1 Q739.6 79.9 737.8 85.2 Q736.0 90.4 737.8 95.2 Q739.7 100.1 744.8 102.2 Q749.9 104.3 755.6 101.3 L761.3 98.2", delay: 1, duration: 0.45 },
  { part: "arrow", d: "M743.8 110.9 Q753.1 140.5 757.6 152.6 Q762.1 164.8 766.0 176.1 L769.9 187.4", delay: 1.4, duration: 0.3 },
  { part: "arrowhead", d: "M758.3 179.1 L770 190 L772.8 174.3", delay: 1.7, duration: 0.15 },
];

export function AboutPhotoMarker() {
  return (
    <svg className="about-photo-marker" data-about-marker viewBox="0 0 936 703" aria-hidden="true" focusable="false">
      {strokes.map((stroke) => (
        <g key={stroke.part} className={stroke.secondPass ? "is-second-pass" : undefined}>
          <path className="about-photo-marker-halo" d={stroke.d} pathLength={1} style={{ animationDelay: `${stroke.delay}s`, animationDuration: `${stroke.duration}s` }} />
          <path className="about-photo-marker-pen" data-marker-part={stroke.part} d={stroke.d} pathLength={1} style={{ animationDelay: `${stroke.delay}s`, animationDuration: `${stroke.duration}s` }} />
        </g>
      ))}
    </svg>
  );
}
