# Homepage Focus and Photo Ribbon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long homepage chapter stack with a recruiter-first hero, LV-first power evidence, compact authentic-photo epilogue, and direct footer path.

**Architecture:** Keep all content local and statically rendered. `app/page.tsx` resolves required project and Workbench records and fails closed; a new server-only `HomepageEpilogue` renders two single-link portals; existing `ProjectRow` and route families remain unchanged. Static-export contract checks protect content/order/absence rules, while Playwright protects geometry, focus, responsive stacking, overflow, and reduced motion.

**Tech Stack:** Next.js 16.2.9 App Router/static export, React 19.2.7, TypeScript 6.0.3, CSS, Phosphor SSR icons, Node static-contract script, Playwright 1.61.1.

## Global Constraints

- Approved design authority: `docs/superpowers/specs/2026-07-19-homepage-focus-and-photo-ribbon-design.md`.
- Preserve warm paper, Barlow Condensed/Inter, square geometry, hairlines, restrained burnt orange, existing sepia photo treatment, and ink footer.
- Add no dependency, client component, route, API, state store, content schema, carousel, animation system, miniature asset, or generated image.
- Hero artifact must be `/images/lv-cabling-design.webp`, passive, descriptive, and unlinked.
- Hero copy must use the exact approved strings from the design specification.
- Keep Tindo Solar wording factual: `Production Worker`, `Nov 2025–present`; add no internal production detail or implied design authority.
- Power rows must be exactly `lv-cabling-design-commercial-complex`, then `solar-grid-connection-assessment`; do not render numeric `01/02` markers.
- Epilogue must contain exactly two portal anchors: UAV to `/projects/gps-denied-autonomous-uav`, then Workbench to `/workbench`.
- Epilogue context may contain the separate `/projects` collection link labelled `View all`; it is not a portal.
- Each portal is one anchor/focus stop with no nested link. Status and identity stay visible without hover.
- Desktop ribbon: `170px` context track, `118px` square portal images, minimum height `142px`. Below `760px`: stacked reading order and `92px` images.
- Footer immediately follows epilogue and remains only major ink surface.
- Touch targets are at least `44 × 44px`; focus is non-colour-only; reduced motion removes transform transitions.
- Required content must throw a slug-naming build error when missing; never use `.filter(Boolean)` for homepage requirements.
- Do not touch case-study evidence/claims, primary navigation, route families, palette, fonts, or generated `.superpowers/` comparison artifacts.
- Worktree is already dirty. Never reset, restore, checkout, delete, or overwrite pre-existing changes. Before each commit, stage only task-owned hunks; if ownership cannot be proved, leave them unstaged and report them.
- Use `git diff --check -- <task files>` before every commit. Never use `git add .`, `git add -A`, or bulk staging.

---

## File responsibility map

| File | Responsibility | Change |
|---|---|---|
| `app/page.tsx` | Homepage composition and required-data resolution | Replace hero positioning/copy, compress Tindo, remove full secondary sections, render epilogue, throw on missing slugs |
| `components/HomepageEpilogue.tsx` | Presentational photo-ribbon markup | New server component; context link plus exactly two portal links |
| `components/SiteFooter.tsx` | Global closing recruiter actions | Apply approved lead/support and explicit Contact route while preserving utility hierarchy |
| `lib/projects.ts` | Curated completed-power ordering | Put LV slug before solar slug |
| `lib/workbench.ts` | Workbench collection lookup | Remove obsolete two-entry homepage slug export; retain `getWorkbenchEntry` |
| `app/globals.css` | Homepage hero/epilogue/footer presentation | Remove obsolete homepage-section rules and add compact ribbon/focus/responsive rules |
| `scripts/portfolio-contract.mjs` | Static semantic/content regression gate | Assert exact narrative, order, portal count/destinations/single-anchor model, exclusions, footer |
| `scripts/layout-check.mjs` | Rendered geometry/interaction regression gate | Replace Tindo-fold assertion with ribbon size, stacking, adjacency, focus, overflow, text-size, reduced-motion checks |
| `DESIGN.md` | Current visual-system authority | Record four-movement homepage and evidence-surface/teaser-surface miniature distinction |
| `PLAN.md` | Historical plan authority | Add explicit homepage supersession notice; preserve unaffected history |
| `docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md` | Historical Workbench authority | Add explicit homepage-preview supersession notice; preserve route/detail rules |
| `design-qa.md` | Durable QA process/evidence log | Append final observed verification only after all gates pass |

## Execution preflight: preserve current worktree

**Interfaces:**
- Consumes: nested portfolio repository at `projects/personal-portfolio`, approved spec commit `572dcf0`.
- Produces: baseline status record in executor commentary/handoff; no file mutation.

- [ ] **Step 1: Re-read local authority before editing**

Run from `C:\Users\natha\OneDrive\Documents\InternalOS`:

```powershell
Get-Content -Raw START_HERE.md
Get-Content -Raw docs/agent-runtime-contract.md
Get-Content -Raw projects/personal-portfolio/AGENTS.md
Get-Content -Raw projects/personal-portfolio/docs/superpowers/specs/2026-07-19-homepage-focus-and-photo-ribbon-design.md
Get-Content -Raw projects/personal-portfolio/docs/superpowers/plans/2026-07-19-homepage-focus-and-photo-ribbon-implementation.md
```

Expected: all five files load; approved spec reports `Status: Approved design`.

- [ ] **Step 2: Capture dirty baseline without changing it**

Run from portfolio repository:

```powershell
git status --short
git diff --name-status
git diff --cached --name-status
git log -3 --oneline
```

Expected: branch includes `572dcf0`; many pre-existing modifications may appear. Record them. If index is non-empty, do not unstage it; exclude those paths/hunks from task commits.

- [ ] **Step 3: Confirm approved assets and forbidden artifacts**

```powershell
Get-Item public/images/lv-cabling-design.webp
Get-Item public/images/gps-denied-uav.webp
Get-Item public/images/workbench/bench-fume-extractor/bench-fume-extractor.jpg
git status --short .superpowers public
```

Expected: three approved assets exist. `.superpowers/` may be untracked; no generated miniature may be staged or copied into `public/`.

---

### Task 1: Recruiter-first hero and LV-first proof

**Files:**
- Modify: `scripts/portfolio-contract.mjs`
- Modify: `app/page.tsx`
- Modify: `lib/projects.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `verifiedPowerProjects`, `profile.resumePath`, existing passive `.hero-image` figure.
- Produces: LV-first `verifiedPowerProjects`; exact broad-power hero; `.hero-credential`; no `.tindo-strip`; existing UAV/Workbench full sections remain temporarily until Task 2.

- [ ] **Step 1: Write failing hero/order/absence contract checks**

In `scripts/portfolio-contract.mjs`, replace current hero, hero-media, Tindo, ledger-order, and old Tindo-order assertions with these exact checks. Leave unrelated nav/profile/Workbench route checks unchanged:

```js
check(home.includes("Electrical engineering student · Adelaide"), "home hero eyebrow must state electrical-engineering student and Adelaide");
check(home.includes("Power systems · networks · renewable integration"), "home hero must state broad power, networks, and renewable-integration positioning");
check(home.includes("I design from standards and verify decisions with calculations—backed by Australian solar-manufacturing exposure."), "home hero must use approved standards-and-manufacturing support copy");
check(home.includes("Nathan") && home.includes("No-ot"), "home hero must render Nathan No-ot");

const heroMedia = home.match(/<figure[^>]*class="hero-image"[^>]*>[\s\S]*?<\/figure>/)?.[0] ?? "";
check(heroMedia.length > 0, "home must expose hero media figure");
check(heroMedia.includes("/images/lv-cabling-design.webp"), "home hero must use LV cabling artifact");
check(!heroMedia.includes("miniature") && !heroMedia.includes("generated_images"), "home hero must exclude miniature content");
check((heroMedia.match(/<a\b/g) ?? []).length === 0, "home hero media must remain passive");

const hero = home.match(/<section[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
check(hero.includes("Currently · Production Worker · Tindo Solar · Nov 2025–present"), "home hero must contain compact factual Tindo credential");
check((home.match(/Tindo Solar/g) ?? []).length === 1, "home must mention Tindo Solar once, inside the hero credential");
check(!home.includes("tindo-strip"), "home must not render standalone Tindo section");

const ledger = home.match(/<ol[^>]*data-evidence-ledger[^>]*>[\s\S]*?<\/ol>/)?.[0] ?? "";
check(ledger.length > 0, "home must expose ordered verified evidence ledger");
const ledgerSlugs = [...ledger.matchAll(/data-project-slug="([^"]+)"/g)].map((match) => match[1]);
check(
  ledgerSlugs.join(",") === "lv-cabling-design-commercial-complex,solar-grid-connection-assessment",
  "home power ledger must contain LV first and solar second, with no extra rows",
);
for (const slug of ledgerSlugs) {
  const row = ledger.match(new RegExp(`<li[^>]*data-project-slug="${slug}"[\\s\\S]*?<\\/li>`))?.[0] ?? "";
  check((row.match(new RegExp(`/projects/${slug}`, "g")) ?? []).length === 1, `${slug} ledger row must have one destination link`);
}
check(!ledger.includes("project-number") && !/>0[12]</.test(ledger), "home power rows must not render numeric editorial markers");

const workbenchIndex = home.indexOf("data-workbench-home");
const broaderWorkIndex = home.indexOf("broader-work");
const ledgerIndex = home.indexOf("data-evidence-ledger");
check(ledgerIndex >= 0 && ledgerIndex < broaderWorkIndex && broaderWorkIndex < workbenchIndex, "temporary Task 1 home must place proof before current work and Workbench");
```

- [ ] **Step 2: Run the contract against current export and verify red**

```powershell
pnpm test:contract
```

Expected: non-zero with messages for broad-power positioning, LV artifact, compact Tindo credential, standalone Tindo removal, and LV-first order.

- [ ] **Step 3: Reorder the verified power slugs**

In `lib/projects.ts`, use:

```ts
export const verifiedPowerSlugs = [
  "lv-cabling-design-commercial-complex",
  "solar-grid-connection-assessment",
] as const;
```

Do not change project records, evidence claims, numbering fields used by other routes, or `broaderEngineeringProjects`.

- [ ] **Step 4: Apply exact hero and section composition**

In `app/page.tsx`:

1. Replace hero role, support, artifact, and completed-work support with:

```tsx
<p className="hero-role">Power systems · networks · renewable integration</p>
<p className="hero-summary">I design from standards and verify decisions with calculations—backed by Australian solar-manufacturing exposure.</p>
<p className="hero-credential">Currently · Production Worker · Tindo Solar · Nov 2025–present</p>
```

```tsx
<Image
  src="/images/lv-cabling-design.webp"
  alt="One-line diagram of a 400 V three-tenancy installation from supply transformer to distribution boards"
  fill
  priority
  sizes="(max-width: 960px) 100vw, 54vw"
/>
```

```tsx
<div className="section-heading">
  <p className="eyebrow">Verified power engineering</p>
  <h2 id="verified-work-heading">Power Systems Work</h2>
  <p>Completed studies showing decisions, standards, calculations, and limitations.</p>
</div>
```

2. Delete the complete `<section className="tindo-strip" ...>` block. Keep full UAV and Workbench sections for this task only.

- [ ] **Step 5: Add compact credential styling and remove obsolete Tindo rules**

Add beside `.hero-summary` in `app/globals.css`:

```css
.hero-credential { color: var(--muted); font-size: .82rem; line-height: 1.55; margin: -.25rem 0 0; }
```

Delete the `.tindo-strip` rule block, its `@media` overrides, and `.tindo-strip` references in print selectors. Do not remove broader-work or Workbench rules until Task 3.

- [ ] **Step 6: Build and prove Task 1 green**

```powershell
pnpm check
pnpm build
pnpm test:contract
git diff --check -- app/page.tsx app/globals.css lib/projects.ts scripts/portfolio-contract.mjs
```

Expected: all exit `0`; contract prints `Portfolio contract checks passed.`

- [ ] **Step 7: Commit only provably task-owned hunks**

Inspect first:

```powershell
git diff -- app/page.tsx app/globals.css lib/projects.ts scripts/portfolio-contract.mjs
```

Stage task-owned hunks only, then verify staged diff contains no unrelated baseline:

```powershell
git diff --cached --check
git diff --cached -- app/page.tsx app/globals.css lib/projects.ts scripts/portfolio-contract.mjs
git commit -m "feat(portfolio): focus homepage on power evidence"
```

Expected: commit succeeds only if safe hunk isolation was possible. Otherwise skip commit and record exact unstaged files for handoff.

---

### Task 2: Fail-closed authentic-photo epilogue

**Files:**
- Create: `components/HomepageEpilogue.tsx`
- Modify: `app/page.tsx`
- Modify: `lib/workbench.ts`
- Modify: `scripts/portfolio-contract.mjs`

**Interfaces:**
- Consumes: `Project`, `WorkbenchEntry`, `broaderEngineeringProjects`, `getWorkbenchEntry(slug)`.
- Produces: `HomepageEpilogue({ uavProject, workbenchEntry }: { uavProject: Project; workbenchEntry: WorkbenchEntry }): JSX.Element`; markers `data-homepage-epilogue`, `data-homepage-portal="uav"`, `data-homepage-portal="workbench"`; slug-naming build errors.

- [ ] **Step 1: Replace temporary secondary-section checks with failing final epilogue contract**

In `scripts/portfolio-contract.mjs`, remove all homepage assertions for `data-workbench-home`, two Workbench detail previews, `broader-work`, and the temporary Task 1 order assertion. Insert:

```js
const epilogue = home.match(/<section[^>]*data-homepage-epilogue[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
check(epilogue.length > 0, "home must expose compact photo epilogue");
check(epilogue.includes("Beyond the ledger") && epilogue.includes("Other systems"), "home epilogue must expose approved context label");
check(epilogue.includes('href="/projects"') && epilogue.includes("View all"), "home epilogue must link to all projects");

const portalAnchors = [...epilogue.matchAll(/<a\b[^>]*data-homepage-portal="([^"]+)"[^>]*>[\s\S]*?<\/a>/g)];
check(portalAnchors.length === 2, "home epilogue must contain exactly two portal anchors");
const portalKinds = portalAnchors.map((match) => match[1]);
check(portalKinds.join(",") === "uav,workbench", "home epilogue portals must keep UAV then Workbench order");
const uavPortal = portalAnchors.find((match) => match[1] === "uav")?.[0] ?? "";
const workbenchPortal = portalAnchors.find((match) => match[1] === "workbench")?.[0] ?? "";
check(uavPortal.includes('href="/projects/gps-denied-autonomous-uav"'), "UAV portal must target its project detail route");
check(uavPortal.includes("In progress") && uavPortal.includes("GPS-Denied UAV") && uavPortal.includes("Indoor autonomy and staged verification."), "UAV portal must use approved visible copy");
check(uavPortal.includes("/images/gps-denied-uav.webp"), "UAV portal must use authentic project photo");
check(workbenchPortal.includes('href="/workbench"'), "Workbench portal must target Workbench collection");
check(workbenchPortal.includes("After hours") && workbenchPortal.includes("Builds, failures, and next iterations."), "Workbench portal must use approved visible copy");
check(workbenchPortal.includes("/images/workbench/bench-fume-extractor/bench-fume-extractor.jpg"), "Workbench portal must use approved authentic fume-extractor photo");
for (const [kind, portal] of [["uav", uavPortal], ["workbench", workbenchPortal]]) {
  check((portal.match(/<a\b/g) ?? []).length === 1, `${kind} portal must contain one anchor and no nested link`);
}
check(!home.includes("data-workbench-home"), "home must not render full Workbench preview section");
check(!home.includes("broader-work"), "home must not render full UAV section");
check(!home.includes("data-miniature-evidence-window") && !home.includes("solar-grid-miniature.png") && !home.includes("generated_images"), "home must exclude miniature assets and markers");

const heroIndex = home.indexOf('class="hero"');
const ledgerIndex = home.indexOf("data-evidence-ledger");
const epilogueIndex = home.indexOf("data-homepage-epilogue");
const footerIndex = home.indexOf("<footer");
check(heroIndex >= 0 && heroIndex < ledgerIndex && ledgerIndex < epilogueIndex && epilogueIndex < footerIndex, "home narrative must be hero, power work, epilogue, footer");
check(/data-homepage-epilogue[\s\S]*?<\/section>\s*<footer\b/.test(home), "footer must immediately follow homepage epilogue");
```

- [ ] **Step 2: Build old markup and verify epilogue checks fail**

```powershell
pnpm build
pnpm test:contract
```

Expected: build succeeds; contract fails for missing epilogue and retained full UAV/Workbench sections.

- [ ] **Step 3: Create focused presentational component**

Create `components/HomepageEpilogue.tsx` exactly:

```tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/projects";
import type { WorkbenchEntry } from "@/lib/workbench";

export function HomepageEpilogue({
  uavProject,
  workbenchEntry,
}: {
  uavProject: Project;
  workbenchEntry: WorkbenchEntry;
}) {
  return (
    <section className="homepage-epilogue" data-homepage-epilogue aria-labelledby="homepage-epilogue-heading">
      <div className="homepage-epilogue-context">
        <p className="eyebrow">Beyond the ledger</p>
        <h2 id="homepage-epilogue-heading">Other systems</h2>
        <Link className="text-link homepage-epilogue-collection" href="/projects">
          View all <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <Link className="homepage-portal" data-homepage-portal="uav" href={`/projects/${uavProject.slug}`}>
        <span className="homepage-portal-image">
          <Image src={uavProject.image} alt={uavProject.imageAlt} fill sizes="(max-width: 760px) 92px, 118px" />
        </span>
        <div className="homepage-portal-copy">
          <span className="homepage-portal-status">In progress</span>
          <h3 className="homepage-portal-title">GPS-Denied UAV</h3>
          <p className="homepage-portal-summary">Indoor autonomy and staged verification.</p>
        </div>
        <ArrowRight className="homepage-portal-arrow" size={20} aria-hidden="true" />
      </Link>

      <Link className="homepage-portal" data-homepage-portal="workbench" href="/workbench">
        <span className="homepage-portal-image">
          <Image src={workbenchEntry.image} alt={workbenchEntry.imageAlt} fill sizes="(max-width: 760px) 92px, 118px" />
        </span>
        <div className="homepage-portal-copy">
          <span className="homepage-portal-status">After hours</span>
          <h3 className="homepage-portal-title">Workbench</h3>
          <p className="homepage-portal-summary">Builds, failures, and next iterations.</p>
        </div>
        <ArrowRight className="homepage-portal-arrow" size={20} aria-hidden="true" />
      </Link>
    </section>
  );
}
```

No `"use client"`, state, data lookup, generic portal schema, nested anchors, or new content abstraction.

- [ ] **Step 4: Make homepage resolution fail closed and replace full sections**

In `app/page.tsx`:

1. Remove `Link` and `WorkbenchEntryPreview` imports.
2. Import `HomepageEpilogue`.
3. Keep `broaderEngineeringProjects`, `verifiedPowerProjects`, `getWorkbenchEntry` imports.
4. Add before `HomePage`:

```tsx
function requireHomepageProject(slug: string) {
  const project = broaderEngineeringProjects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Missing required homepage project: ${slug}`);
  return project;
}

function requireHomepageWorkbenchEntry(slug: string) {
  const entry = getWorkbenchEntry(slug);
  if (!entry) throw new Error(`Missing required homepage Workbench entry: ${slug}`);
  return entry;
}
```

5. Resolve exact records at function start:

```tsx
const uavProject = requireHomepageProject("gps-denied-autonomous-uav");
const workbenchEntry = requireHomepageWorkbenchEntry("bench-fume-extractor");
```

6. Delete the full conditional UAV section and full `data-workbench-home` section. Render this immediately after Power Systems Work:

```tsx
<HomepageEpilogue uavProject={uavProject} workbenchEntry={workbenchEntry} />

<SiteFooter />
```

- [ ] **Step 5: Remove obsolete homepage Workbench selection export**

Delete only this block from `lib/workbench.ts`:

```ts
// Kept separate from collection order so the homepage stays intentionally curated.
export const homepageWorkbenchSlugs = ["bench-fume-extractor", "tarmo5"] as const;
```

Retain `getWorkbenchEntry(slug: string): WorkbenchEntry | undefined` unchanged for route and homepage lookup.

- [ ] **Step 6: Prove fail-closed behavior once, then restore**

Temporarily change the page lookup string to `gps-denied-autonomous-uav-missing`, run:

```powershell
pnpm build
```

Expected: non-zero build with `Missing required homepage project: gps-denied-autonomous-uav-missing`.

Restore exact approved slug immediately, then run:

```powershell
pnpm check
pnpm build
pnpm test:contract
git diff --check -- app/page.tsx components/HomepageEpilogue.tsx lib/workbench.ts scripts/portfolio-contract.mjs
```

Expected: all exit `0`; contract passes.

- [ ] **Step 7: Commit task-owned epilogue change**

```powershell
git diff -- app/page.tsx components/HomepageEpilogue.tsx lib/workbench.ts scripts/portfolio-contract.mjs
git diff --cached --check
git commit -m "feat(portfolio): add compact photo epilogue"
```

Stage only reviewed task hunks. Never include `.superpowers/` or generated image files.

---

### Task 3: Ribbon geometry, responsive behavior, and rendered layout gate

**Files:**
- Modify: `app/globals.css`
- Modify: `scripts/layout-check.mjs`

**Interfaces:**
- Consumes: Task 2 class/marker contract.
- Produces: 170px/118px desktop grid; stacked/92px sub-760 layout; visible focus; restrained hover; automated geometry, adjacency, overflow, enlarged-text, and reduced-motion checks.

- [ ] **Step 1: Replace Tindo fold check with failing epilogue geometry checks**

Update the header comment in `scripts/layout-check.mjs` to:

```js
// Layout boundary check: serves `out/`, sweeps route/viewport boundaries,
// rejects horizontal overflow, verifies homepage epilogue geometry/focus/order,
// and saves screenshots under test-results/layout/.
```

Extend `ROUTES` with both destinations introduced by the ribbon:

```js
  "/projects/gps-denied-autonomous-uav",
  "/workbench/bench-fume-extractor",
```

Keep every existing route, including both completed power case studies.

Inside the route loop, replace the old `if (route === "/" && width >= 1440)` Tindo block with:

```js
if (route === "/") {
  const epilogue = page.locator("[data-homepage-epilogue]");
  const portals = page.locator("[data-homepage-portal]");
  if ((await epilogue.count()) !== 1) failures.push(`/ @ ${width}x${height}: homepage epilogue count is not 1`);
  if ((await portals.count()) !== 2) failures.push(`/ @ ${width}x${height}: homepage portal count is not 2`);

  const footerAdjacent = await page.evaluate(() => {
    const ribbon = document.querySelector("[data-homepage-epilogue]");
    return ribbon?.nextElementSibling?.matches(".site-footer") ?? false;
  });
  if (!footerAdjacent) failures.push(`/ @ ${width}x${height}: footer does not immediately follow epilogue`);

  const expectedImageSize = width < 760 ? 92 : 118;
  const imageBoxes = await page.locator(".homepage-portal-image").evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );
  for (const [index, box] of imageBoxes.entries()) {
    if (Math.abs(box.width - expectedImageSize) > 1 || Math.abs(box.height - expectedImageSize) > 1) {
      failures.push(`/ @ ${width}x${height}: portal ${index + 1} image is ${Math.round(box.width)}x${Math.round(box.height)}, expected ${expectedImageSize}px square`);
    }
  }

  if (width >= 760) {
    const epilogueHeight = await epilogue.evaluate((node) => node.getBoundingClientRect().height);
    if (epilogueHeight < 142 || epilogueHeight > 220) {
      failures.push(`/ @ ${width}x${height}: desktop epilogue height ${Math.round(epilogueHeight)}px is outside compact 142-220px range`);
    }
  }

  for (let index = 0; index < (await portals.count()); index += 1) {
    const portal = portals.nth(index);
    await portal.focus();
    const focus = await portal.evaluate((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), width: rect.width, height: rect.height };
    });
    if (focus.outlineStyle === "none" || focus.outlineWidth < 2) failures.push(`/ @ ${width}x${height}: portal ${index + 1} lacks non-colour focus outline`);
    if (focus.width < 44 || focus.height < 44) failures.push(`/ @ ${width}x${height}: portal ${index + 1} misses 44px touch target`);
  }
}
```

- [ ] **Step 2: Run current unstyled component and verify layout red**

```powershell
pnpm test:layout
```

Expected: non-zero with portal image-size and/or desktop compact-height failures.

- [ ] **Step 3: Add exact desktop and mobile ribbon CSS**

Delete obsolete `.broader-work`, `.project-status-label`, `.workbench-home`, `.workbench-home-grid`, and homepage-specific `.workbench-home-grid .workbench-preview...` rules. Keep shared Workbench collection/detail/preview rules.

Add after `.row-action` rules:

```css
.homepage-epilogue { border-top: 1px solid var(--line); display: grid; grid-template-columns: 170px repeat(2, minmax(0, 1fr)); min-height: 142px; padding: 0 6vw; }
.homepage-epilogue-context { align-content: center; display: grid; gap: .55rem; padding: 1rem 1.25rem 1rem 0; }
.homepage-epilogue-context h2 { font: 600 1.5rem/1 var(--display); margin: 0; text-transform: uppercase; }
.homepage-epilogue-collection { align-items: center; display: inline-flex; gap: .35rem; min-height: 44px; width: fit-content; }
.homepage-portal { align-items: center; border-left: 1px solid var(--line); color: inherit; display: grid; gap: 1rem; grid-template-columns: 118px minmax(0, 1fr) 20px; min-height: 142px; padding: 12px clamp(1rem, 2vw, 2rem); }
.homepage-portal:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: -3px; }
.homepage-portal-image { background: var(--paper-deep); display: block; height: 118px; overflow: hidden; position: relative; width: 118px; }
.homepage-portal-image img { filter: sepia(.08); object-fit: cover; transition: transform .45s ease; }
.homepage-portal:hover .homepage-portal-image img, .homepage-portal:focus-visible .homepage-portal-image img { transform: scale(1.025); }
.homepage-portal-copy { display: grid; gap: .3rem; min-width: 0; }
.homepage-portal-status { color: var(--accent-dark); font: 600 .7rem/1.2 var(--display); letter-spacing: .13em; text-transform: uppercase; }
.homepage-portal-title { font: 600 clamp(1.35rem, 2vw, 2rem)/1 var(--display); margin: 0; text-transform: uppercase; }
.homepage-portal-summary { color: var(--muted); font-size: .82rem; line-height: 1.5; margin: 0; }
.homepage-portal-arrow { color: var(--accent-dark); transition: transform .2s ease; }
.homepage-portal:hover .homepage-portal-arrow, .homepage-portal:focus-visible .homepage-portal-arrow { transform: translateX(3px); }
```

Add a dedicated breakpoint after the 960px block and before the 720px block:

```css
@media (max-width: 759px) {
  .homepage-epilogue { grid-template-columns: 1fr; min-height: 0; padding: 0 1.25rem; }
  .homepage-epilogue-context { min-height: 124px; padding: 1.25rem 0; }
  .homepage-portal { border-left: 0; border-top: 1px solid var(--line); grid-template-columns: 92px minmax(0, 1fr) 20px; min-height: 124px; padding: 16px 0; }
  .homepage-portal-image { height: 92px; width: 92px; }
}
```

Remove obsolete `.workbench-home-grid` and `.tindo-strip` responsive lines. Existing global reduced-motion rule already collapses all transition durations; do not create another motion system.

- [ ] **Step 4: Add enlarged-text and reduced-motion probes**

Before `await browser.close()` in `scripts/layout-check.mjs`, add:

```js
  const accessibilityPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await accessibilityPage.goto(`${base}/`, { waitUntil: "networkidle" });
  await accessibilityPage.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const enlargedOverflow = await accessibilityPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (enlargedOverflow > 1) failures.push(`/ @ 390x844 with 200% root text: horizontal overflow ${enlargedOverflow}px`);
  await accessibilityPage.screenshot({ path: join(SHOT_DIR, "home-390x844-text-200.png"), fullPage: true });

  await accessibilityPage.emulateMedia({ reducedMotion: "reduce" });
  await accessibilityPage.reload({ waitUntil: "networkidle" });
  const reducedDuration = await accessibilityPage.locator(".homepage-portal-image img").first().evaluate(
    (node) => parseFloat(getComputedStyle(node).transitionDuration) || 0,
  );
  if (reducedDuration > 0.01) failures.push(`/ reduced motion: portal image transition remains ${reducedDuration}s`);
  await accessibilityPage.close();
```

Move the existing `await browser.close()` after this block. Keep the current nine-width route sweep and existing static server.

- [ ] **Step 5: Prove geometry and interaction green**

```powershell
pnpm check
pnpm build
pnpm test:contract
pnpm test:layout
git diff --check -- app/globals.css scripts/layout-check.mjs
```

Expected: all exit `0`; layout reports 99 route/viewport combinations and writes screenshots under `test-results/layout/`. Home images measure `92px` at 320/375/390/720 widths and `118px` at 768+ widths.

- [ ] **Step 6: Commit task-owned styling and gate changes**

```powershell
git diff -- app/globals.css scripts/layout-check.mjs
git diff --cached --check
git commit -m "test(portfolio): lock homepage ribbon layout"
```

Stage only reviewed Task 3 hunks.

---

### Task 4: Footer recruiter path

**Files:**
- Modify: `scripts/portfolio-contract.mjs`
- Modify: `components/SiteFooter.tsx`

**Interfaces:**
- Consumes: `profile.links.linkedin`, `profile.resumePath`, existing footer CSS/hierarchy.
- Produces: approved footer lead/support; Contact route; resume, LinkedIn, Projects, Workbench; recruiter utility remains last.

- [ ] **Step 1: Add failing footer copy/action/order contract**

Replace current footer checks in `scripts/portfolio-contract.mjs` with:

```js
const footer = home.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
check(footer.includes("Build power infrastructure with me."), "footer must use approved power-infrastructure lead");
check(footer.includes("Available for South Australian internships."), "footer must use approved internship availability support");
for (const destination of ["/contact", "/projects", "/workbench", "/profile"]) {
  check(footer.includes(`href="${destination}"`), `footer must link ${destination}`);
}
check(/href="\/nathan-noot-general-resume\.pdf"[^>]*download/.test(footer), "footer must provide resume download");
check(footer.includes("linkedin.com"), "footer must provide LinkedIn action");
const footerAnchors = [...footer.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
const footerUtilityLinkIndex = footerAnchors.findIndex((anchor) => anchor.includes("data-footer-utility"));
check(footerUtilityLinkIndex === footerAnchors.length - 1, "footer recruiter utility must remain the final and quiet action");
```

- [ ] **Step 2: Verify contract red against existing footer**

```powershell
pnpm test:contract
```

Expected: non-zero for approved footer lead, support, and `/contact` action.

- [ ] **Step 3: Replace footer markup with exact approved hierarchy**

Use this `SiteFooter` return body:

```tsx
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
```

Remove the unused `mailto:` footer action; Contact page retains direct email access. Do not change primary navigation.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm check
pnpm build
pnpm test:contract
pnpm test:layout
git diff --check -- components/SiteFooter.tsx scripts/portfolio-contract.mjs
```

Expected: all exit `0`; footer remains responsive at every layout viewport.

```powershell
git diff -- components/SiteFooter.tsx scripts/portfolio-contract.mjs
git diff --cached --check
git commit -m "feat(portfolio): sharpen footer recruiter path"
```

Stage only reviewed Task 4 hunks.

---

### Task 5: Reconcile design and historical plan authority

**Files:**
- Modify: `DESIGN.md`
- Modify: `PLAN.md`
- Modify: `docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md`

**Interfaces:**
- Consumes: approved design spec section 15 and implemented class/route behavior.
- Produces: one unambiguous current homepage rule; historical plans remain useful only for unaffected routes and policies.

- [ ] **Step 1: Add current homepage component authority to `DESIGN.md`**

After `### Project rows`, insert:

```markdown
### Homepage narrative and photo epilogue

Homepage has four movements after header: broad power hero with compact factual
Tindo credential; LV-first Power Systems Work; compact authentic-photo
epilogue; ink footer. Standalone Tindo, full UAV, and full Workbench homepage
sections are retired.

`homepage-epilogue` is an exit ramp, not another evidence ledger: a 170px
context track plus exactly two single-link portals (UAV, then Workbench), using
118px authentic square photos and a minimum desktop height of 142px. Below
760px it stacks in DOM order with 92px photos. Footer follows immediately.

Homepage excludes miniature art. Future miniature work requires a separate
design cycle and must not reuse generated brainstorming comparisons as public
assets.
```

- [ ] **Step 2: Replace absolute miniature-pairing rule with surface-specific rule**

Inside `### Deferred personality layer: miniature evidence windows`, replace the bullet beginning `Pair every miniature...` with:

```markdown
- On an evidence surface, pair and subordinate every miniature to its related
  authentic artifact, diagram, calculation, or measured result. The real
  artifact remains primary proof.
- On a dedicated navigation or teaser surface, a miniature may stand alone only
  when the title, status, and destination are explicit and the destination page
  carries the proof. Treat this as a coherent authored system, not scattered
  decoration.
```

Keep deferred status, field-notes visual constraints, and prohibition on fake technical decoration.

- [ ] **Step 3: Mark older homepage plans as superseded without rewriting history**

After the title in `PLAN.md`, add:

```markdown
> **Homepage status (2026-07-19):** Homepage ordering, hero positioning,
> standalone Tindo/UAV/Workbench sections, and footer lead copy are superseded
> by `docs/superpowers/specs/2026-07-19-homepage-focus-and-photo-ribbon-design.md`.
> This plan remains historical authority only for unaffected About, voice,
> disclosure, and verification decisions.
```

After the frontmatter in `docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md`, add:

```markdown
> **Homepage status (2026-07-19):** Requirements for two full homepage
> Workbench previews and the older homepage order are superseded by
> `docs/superpowers/specs/2026-07-19-homepage-focus-and-photo-ribbon-design.md`.
> Workbench collection/detail, attribution, evidence, public-safety, and
> accessibility requirements remain authoritative.
```

- [ ] **Step 4: Verify authority text and commit**

```powershell
rg -n "Homepage narrative and photo epilogue|evidence surface|navigation or teaser surface" DESIGN.md
rg -n "Homepage status \(2026-07-19\)" PLAN.md docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md
git diff --check -- DESIGN.md PLAN.md docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md
```

Expected: three DESIGN matches; one status match in each historical plan; diff check exits `0`.

```powershell
git diff -- DESIGN.md PLAN.md docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md
git diff --cached --check
git commit -m "docs(portfolio): reconcile focused homepage authority"
```

Stage only reviewed Task 5 hunks; those historical plan files already contain user changes.

---

### Task 6: Full audit, observed evidence, and delivery gate

**Files:**
- Modify: `design-qa.md` only after every check passes
- Generate: `test-results/layout/*.png` (ignored test evidence)
- Generate: `audits/homepage-focus-2026-07-19/impeccable.json` (audit evidence; stage only if repository policy permits)

**Interfaces:**
- Consumes: completed Tasks 1–5, `design-qa.md`, `PRE-PUBLISH-GATE.md`, `.impeccable/config.json`.
- Produces: verified static export, rendered evidence, audit record, explicit go/no-go result.

- [ ] **Step 1: Run clean technical gate**

```powershell
pnpm check
pnpm build
pnpm test:contract
pnpm test:layout
git diff --check
```

Expected: five exit `0`; contract prints `Portfolio contract checks passed.`; layout prints 81 route/viewport combinations plus enlarged-text and reduced-motion probes.

- [ ] **Step 2: Smoke all affected and linked routes**

Confirm static files exist:

```powershell
Get-Item out/index.html
Get-Item out/profile.html
Get-Item out/projects.html
Get-Item out/workbench.html
Get-Item out/contact.html
Get-Item out/projects/gps-denied-autonomous-uav.html
Get-Item out/projects/lv-cabling-design-commercial-complex.html
Get-Item out/projects/solar-grid-connection-assessment.html
Get-Item out/sitemap.xml
```

Expected: all nine paths exist and have non-zero length.

Confirm structured data and sitemap survived the homepage change:

```powershell
Select-String -Path out/index.html -Pattern 'application/ld\+json|"@type":"Person"'
Select-String -Path out/profile.html -Pattern 'application/ld\+json|"@type":"ProfilePage"'
Select-String -Path out/sitemap.xml -Pattern '/profile|/projects|/workbench|gps-denied-autonomous-uav|lv-cabling-design-commercial-complex|solar-grid-connection-assessment'
```

Expected: homepage and profile expose JSON-LD; sitemap contains each named route family and linked project.

- [ ] **Step 3: Run deterministic design finder**

Create audit directory with PowerShell, then run:

```powershell
New-Item -ItemType Directory -Force audits/homepage-focus-2026-07-19
npx impeccable detect ./out --json | Tee-Object -FilePath audits/homepage-focus-2026-07-19/impeccable.json
```

Expected: valid JSON written. Judge findings against approved spec and existing waivers; fix real P0/P1/P2 regressions, rerun all Task 6 Step 1 gates, and do not suppress findings merely to get green output.

- [ ] **Step 4: Perform rendered browser judgment**

Inspect generated homepage captures at `390x844`, `768x1024`, and `1440x900`, plus boundary widths `320`, `375`, `720`, `960`, `1024`, and `1920`.

Pass only if observed:

- Identity, broad power focus, LV artifact, and resume action remain clear at thumbnail scale.
- LV case is visibly first; solar remains second.
- Ribbon reads as compact exit ramp, not a third major project section.
- Photos look native to warm-paper system; no card fill, radius, shadow, or second dark band.
- UAV precedes Workbench in visual, DOM, and focus order.
- Footer immediately follows ribbon and remains recognisable.
- No doubled hairlines, clipped images, horizontal scroll, or awkward title wrapping.
- 200% browser zoom at desktop and enlarged text preserve actions and reading order.
- Keyboard reaches hero actions, two Power rows, View all, UAV portal, Workbench portal, footer actions; portal focus outline is visible.
- Mobile menu still opens, closes on Escape, and returns focus.
- Reduced-motion mode shows no portal scale/arrow motion.
- Resume, Contact, LinkedIn, Projects, Workbench, profile utility, and both portal destinations resolve correctly.

If any criterion fails, fix smallest relevant CSS/markup/test, rerun Task 6 Step 1, and repeat judgment.

- [ ] **Step 5: Append exact passing evidence to `design-qa.md`**

Only after Steps 1–4 pass, append:

```markdown

## Homepage focus and photo epilogue - 2026-07-19

**Scope**

- Reduced homepage to hero, LV-first Power Systems Work, compact authentic-photo
  epilogue, and footer.
- Compressed factual Tindo Solar context into hero and removed full Tindo, UAV,
  and Workbench homepage sections.
- Kept miniatures out of homepage; UAV and Workbench portals use authentic
  existing photos.

**Automated verification**

- `pnpm check`, `pnpm build`, `pnpm test:contract`, `pnpm test:layout`, and
  `git diff --check` exited 0.
- Contract verified exact hero positioning, passive LV artifact, LV-first power
  order, two single-link portal destinations, retired-section absence, no
  miniature markers, footer adjacency, and recruiter actions.
- Layout gate passed eleven routes across nine viewports (320-1920px), 200% root
  text overflow probe, reduced-motion probe, portal geometry, touch targets,
  focus outline, and footer adjacency.

**Rendered judgment**

- Homepage captures at 390, 768, and 1440px preserved identity, broad-power
  positioning, LV evidence priority, compact ribbon hierarchy, and direct
  footer path at thumbnail scale.
- 200% browser zoom, keyboard-only navigation, mobile-menu Escape/focus return,
  link destinations, image crops, DOM order, and reduced motion passed.
- `impeccable detect` output is recorded at
  `audits/homepage-focus-2026-07-19/impeccable.json`; no unresolved P0/P1/P2
  finding remains.

final result: SIGNED OFF.
```

Do not append this text if a stated observation was not actually performed.

- [ ] **Step 6: Final scope and forbidden-artifact audit**

```powershell
git status --short
git diff --stat
git diff --name-only
git diff --cached --name-only
git ls-files .superpowers public | Select-String -Pattern "generated_images|miniature"
```

Expected: implementation scope matches file map; no `.superpowers` file or newly generated miniature is staged. Existing dormant historical assets may appear only if already tracked and unchanged.

- [ ] **Step 7: Commit QA record only if safely isolated**

```powershell
git diff -- design-qa.md audits/homepage-focus-2026-07-19/impeccable.json
git diff --cached --check
git commit -m "docs(portfolio): record homepage focus verification"
```

Stage only actual passing evidence and task-owned audit output. If JSON contains machine-local paths or prohibited material, leave it ignored/untracked and reference only the command/result in `design-qa.md`.

- [ ] **Step 8: Produce implementation handoff**

Report:

- Commits created, plus files deliberately left unstaged because they overlapped pre-existing changes.
- Exact pass output for check/build/contract/layout/diff.
- Browser widths, zoom, keyboard, reduced-motion, and links observed.
- Impeccable findings fixed or judged with reason.
- Remaining risks; use `none` if none.
- Explicit confirmation that no miniature/generated asset entered production.

Do not deploy, push, open a PR, or modify live infrastructure without separate user authorization.

---

## Authorization and Terra handoff gate

Plan authoring ends here. Do not implement any task until Nathan No-ot explicitly authorizes this plan.

After authorization, hand execution to one worker using:

- Model: `gpt-5.6-terra`
- Reasoning effort: `high`
- Required skill: `superpowers:executing-plans`
- Ownership: all implementation-plan files listed above, while preserving every unrelated dirty-worktree change
- First action: run Execution preflight, then execute Tasks 1–6 sequentially with checkpoint evidence
- Prohibitions: no reset/revert, no broad staging, no `.superpowers`/generated miniature production assets, no deployment/push/PR

Use `workflows/agent-handoff.md` for handoff content. Terra must be told it is not alone in the codebase and must adapt around existing edits rather than reverting them.
