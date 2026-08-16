# Contact Desktop Round-2 Implementation Plan

> **Execution:** implement task by task with `executing-plans` (inline) or
> `codex-build` (frozen spec handed to Codex). Steps use checkbox syntax for
> tracking.

**Goal:** Rework `/contact` desktop (≥1240px) into one continuous single-flow
composition and remove the ink rail between the contact block and the
Technical Snapshot above 720px, leaving mobile (≤720px) untouched.

**Architecture:** CSS-only change in `app/globals.css` — delete the
`min-width: 1240px` contact-column split, drop both base ink rules, restore
the snapshot heading's ink top rule in the mobile override only. The
`scripts/layout-check.mjs` browser contract is updated to assert the new
geometry and to prove the deletions at source level.

**Stack:** Next.js static export, plain CSS, Playwright-based layout contract.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-16-contact-desktop-round2-amendment.md` (APPROVED, rev 2).
- Mobile (`max-width: 720px`) design must remain pixel-identical, including
  the snapshot heading's ink top rule.
- Tablet is the base CSS layout; mobile is one `max-width: 720px` override;
  desktop is one `min-width: 1240px` override. No new breakpoints.
- Ledger geometry (A2) must not change: desktop `role/study/path` spans 2/6
  and `verified/build` spans 3/6; tablet `role/study` 1/2, `path` 2/2,
  `verified/build` 1/2; zero grid gaps; 1rem inset dividers.
- No dependency, component, route, copy, or footer changes.
- Do not commit unless Nathan explicitly asks. All edits stay in
  `app/globals.css` and `scripts/layout-check.mjs`.

---

### Task 1: Update layout-check.mjs to assert round-2 geometry (fails first)

**Files:**
- Modify: `scripts/layout-check.mjs` — anchor on literal strings below, not
  line numbers

**Interfaces:**
- Consumes: existing `out/` static export (built 2026-08-15, old A2 CSS)
- Produces: same failures/informational arrays; no new exports

- [ ] **Step 1: Make the route-sweep heading border check width-dependent**

Find:

```js
        const headingStyle = await snapshot.locator(".technical-snapshot-heading").evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            borderTop: style.borderTopWidth,
            borderBottom: style.borderBottomWidth,
            background: style.backgroundColor,
            radius: style.borderRadius,
            shadow: style.boxShadow,
          };
        });
        if (headingStyle.borderTop !== "1px" || headingStyle.borderBottom !== "1px" || headingStyle.radius !== "0px" || headingStyle.shadow !== "none") {
          failures.push("/contact @ " + width + "x" + height + ": snapshot heading rules/furniture are incorrect");
        }
```

Replace with:

```js
        const headingStyle = await snapshot.locator(".technical-snapshot-heading").evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            borderTop: style.borderTopWidth,
            borderBottom: style.borderBottomWidth,
            background: style.backgroundColor,
            radius: style.borderRadius,
            shadow: style.boxShadow,
          };
        });
        const expectedHeadingTop = width <= 720 ? "1px" : "0px";
        if (headingStyle.borderTop !== expectedHeadingTop || headingStyle.borderBottom !== "1px" || headingStyle.radius !== "0px" || headingStyle.shadow !== "none") {
          failures.push("/contact @ " + width + "x" + height + ": snapshot heading rules/furniture are incorrect (borderTop " + headingStyle.borderTop + ")");
        }
```

- [ ] **Step 2: Add `borderTop` to the contact metric `styleData`**

Find:

```js
          borderLeft: parseFloat(style.borderLeftWidth),
          borderBottom: parseFloat(style.borderBottomWidth),
```

Replace with:

```js
          borderLeft: parseFloat(style.borderLeftWidth),
          borderBottom: parseFloat(style.borderBottomWidth),
          borderTop: parseFloat(style.borderTopWidth),
```

- [ ] **Step 3: Replace the desktop split assertions with single-flow assertions**

Find:

```js
      if (style("details") && width >= 1240) {
        if (Math.abs(style("details").borderLeft - 1) > 1) failures.push(`${prefix}: desktop Details divider is not 1px`);
        if (Math.abs(style("details").paddingLeft - 22.4) > 1) failures.push(`${prefix}: desktop Details padding-left is ${style("details").paddingLeft}px, expected 22.4px`);
        const contentWidth = rect("details").width - style("details").paddingLeft - style("details").borderLeft;
        if (width === 1240 && Math.abs(contentWidth - 528) > 1) failures.push(`${prefix}: Details content box is ${contentWidth.toFixed(2)}px, expected 528px`);
        if (rect("email") && rect("copy") && Math.abs(rect("email").top - rect("copy").top) > 1) failures.push(`${prefix}: email and Copy address do not share one action row`);
        if (!rect("hero") || !rect("details") || rect("hero").left >= rect("details").left) failures.push(`${prefix}: desktop hero is not left of Details`);
      } else if (style("details") && (Math.abs(style("details").borderLeft) > 1 || Math.abs(style("details").paddingLeft) > 1)) {
        failures.push(`${prefix}: tablet Details retains desktop divider/inset`);
      }
      if (rect("heading") && rect("column")) {
        const minimumRuleGap = Math.min(28, Math.max(20, width * 0.02));
        if (rect("heading").top - rect("column").bottom < minimumRuleGap - 1) failures.push(`${prefix}: upper closing rule and ledger heading rule are too close`);
      }
```

Replace with:

```js
      if (style("details") && (Math.abs(style("details").borderLeft) > 0.5 || Math.abs(style("details").paddingLeft) > 0.5)) {
        failures.push(`${prefix}: Details retains desktop divider/inset`);
      }
      if (style("column") && Math.abs(style("column").borderBottom) > 0.5) {
        failures.push(`${prefix}: contact column retains ink rail (borderBottom ${style("column").borderBottom}px)`);
      }
      if (style("heading")) {
        const expectedHeadingTop = width <= 720 ? 1 : 0;
        if (Math.abs(style("heading").borderTop - expectedHeadingTop) > 0.5) failures.push(`${prefix}: snapshot heading top ink rule is ${style("heading").borderTop}px, expected ${expectedHeadingTop}px`);
      }
      if (width >= 721) {
        if (rect("hero") && rect("details") && rect("hero").bottom > rect("details").top + 1) failures.push(`${prefix}: hero is not above Details`);
      }
      if (width >= 1240) {
        if (rect("actions") && rect("details") && rect("actions").bottom > rect("details").bottom + 1) failures.push(`${prefix}: desktop actions escape Details`);
        if (rect("hero") && rect("details") && Math.abs(rect("hero").left - rect("details").left) > 1) failures.push(`${prefix}: desktop hero and Details do not share a start edge`);
        if (rect("email") && rect("copy") && Math.abs(rect("email").top - rect("copy").top) > 1) failures.push(`${prefix}: email and Copy address do not share one action row`);
      }
```

- [ ] **Step 4: Add source-level CSS assertions (AC-13 deletions + mobile restore)**

Find (immediately after the `CONTACT_TEXT_VIEWPORTS` loop's closing brace,
before the `for (const width of [721, 768, 840]) {` projects-tablet loop):

```js
  for (const width of [721, 768, 840]) {
```

Insert before it:

```js
  {
    const cssSource = await readFile(join("app", "globals.css"), "utf8");
    const desktopBlock = cssSource.match(/@media \(min-width: 1240px\) \{([\s\S]*?)\n\}/);
    const mobileBlock = cssSource.match(/@media \(max-width: 720px\) \{([\s\S]*?)\n\}/);
    if (!desktopBlock) {
      failures.push("globals.css: missing 1240px block");
    } else {
      if (desktopBlock[1].includes(".contact-column")) failures.push("globals.css: 1240px block still styles .contact-column");
      if (desktopBlock[1].includes(".contact-details")) failures.push("globals.css: 1240px block still styles .contact-details");
      if (!desktopBlock[1].includes(".technical-snapshot")) failures.push("globals.css: 1240px block lost .technical-snapshot ledger override");
      if (!desktopBlock[1].includes('data-snapshot-group="path"')) failures.push("globals.css: 1240px block lost path divider rule");
    }
    if (!mobileBlock) {
      failures.push("globals.css: missing 720px block");
    } else {
      if (mobileBlock[1].includes(".contact-column")) failures.push("globals.css: 720px block retains dead .contact-column reset");
      if (mobileBlock[1].includes(".contact-details")) failures.push("globals.css: 720px block retains dead .contact-details reset");
      if (!mobileBlock[1].includes(".technical-snapshot-heading")) failures.push("globals.css: 720px block does not restore snapshot heading ink top rule");
    }
    if (!cssSource.includes(".contact-column { border-bottom: 0; min-width: 0; padding-bottom: 0; }")) {
      failures.push("globals.css: base .contact-column does not match `border-bottom: 0; min-width: 0; padding-bottom: 0;`");
    }
    if (!cssSource.includes(".technical-snapshot-heading { border-bottom: 1px solid var(--line); padding: .7rem 0; }")) {
      failures.push("globals.css: base snapshot heading does not match `border-bottom: 1px solid var(--line); padding: .7rem 0;`");
    }
  }

  for (const width of [721, 768, 840]) {
```

- [ ] **Step 5: Run against the existing old-CSS export and confirm the new
  assertions fail**

Run: `pnpm test:layout`
Expected: FAIL. The failure list must include, at minimum: snapshot heading
top ink rule failures at 721/768/960/1024/1440/1920 widths, contact column
ink rail failures above 720px, Details divider/inset failures at ≥1240px,
and all five new `globals.css:` source failures. Assertions unrelated to
this change (home, projects, footer, group order, ledger spans) must not
appear as new failures. This proves the contract bites before CSS changes.

---

### Task 2: Apply the CSS changes

**Files:**
- Modify: `app/globals.css` — anchor on literal strings below

**Interfaces:**
- Consumes: Task 1 contract expectations
- Produces: round-2 geometry; no class names added or removed

- [ ] **Step 1: Remove the base ink rail on `.contact-column`**

Find:

```css
.contact-column { border-bottom: 1px solid var(--ink); min-width: 0; padding-bottom: clamp(1.5rem, 3vw, 2rem); }
```

Replace with:

```css
.contact-column { border-bottom: 0; min-width: 0; padding-bottom: 0; }
```

- [ ] **Step 2: Remove the base ink top rule on `.technical-snapshot-heading`**

Find:

```css
.technical-snapshot-heading { border-bottom: 1px solid var(--line); border-top: 1px solid var(--ink); padding: .7rem 0; }
```

Replace with:

```css
.technical-snapshot-heading { border-bottom: 1px solid var(--line); padding: .7rem 0; }
```

- [ ] **Step 3: Delete the desktop contact-column split from the 1240 block**

Find:

```css
@media (min-width: 1240px) {
  .contact-column { align-items: end; column-gap: clamp(1rem, 2vw, 2rem); display: grid; grid-template-areas: "eyebrow details" "headline details"; grid-template-columns: minmax(0, 1fr) fit-content(calc(528px + 1px + 1.4rem)); }
  .contact-column > .eyebrow { grid-area: eyebrow; }
  .contact-column > h1 { grid-area: headline; }
  .contact-details { align-self: end; border-left: 1px solid var(--line); grid-area: details; padding-left: 1.4rem; }
  .technical-snapshot { grid-template-areas: "heading heading heading heading heading heading" "role role study study path path" "verified verified verified build build build"; grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .technical-snapshot-group[data-snapshot-group="path"] { border-left: 1px solid var(--line); padding-left: 1rem; }
}
```

Replace with:

```css
@media (min-width: 1240px) {
  .technical-snapshot { grid-template-areas: "heading heading heading heading heading heading" "role role study study path path" "verified verified verified build build build"; grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .technical-snapshot-group[data-snapshot-group="path"] { border-left: 1px solid var(--line); padding-left: 1rem; }
}
```

- [ ] **Step 4: Delete the two dead mobile resets and restore the heading
  ink top rule in the mobile block**

Find:

```css
  .contact-layout { gap: 2.5rem; grid-template-columns: 1fr; }
  .contact-column { border-bottom: 0; padding-bottom: 0; }
  .contact-details { border-left: 0; padding-left: 0; }
  .contact-actions { align-items: stretch; display: grid; gap: .75rem; }
```

Replace with:

```css
  .contact-layout { gap: 2.5rem; grid-template-columns: 1fr; }
  .contact-actions { align-items: stretch; display: grid; gap: .75rem; }
```

Find:

```css
  .technical-snapshot .technical-snapshot-group[data-snapshot-group] { border-left: 0; padding: 1rem 0; }
  .technical-snapshot-links { grid-template-columns: 1fr; }
```

Replace with:

```css
  .technical-snapshot .technical-snapshot-group[data-snapshot-group] { border-left: 0; padding: 1rem 0; }
  .technical-snapshot-heading { border-top: 1px solid var(--ink); }
  .technical-snapshot-links { grid-template-columns: 1fr; }
```

- [ ] **Step 5: Rebuild and run the full verification suite**

Run: `pnpm check`
Expected: PASS (no TypeScript errors; CSS is not typechecked)

Run: `pnpm build`
Expected: PASS, static export regenerated

Run: `pnpm test:contract`
Expected: PASS (static Contact copy/semantics unchanged)

Run: `pnpm test:layout`
Expected: PASS — every Task 1 assertion now green, including the source
checks and the mobile 720px heading ink top rule.

---

### Task 3: Visual confirmation and diff hygiene

**Files:**
- None new. Screenshots regenerate under `test-results/layout/`.

- [ ] **Step 1: Inspect the regenerated Contact screenshots**

Open and check these files in a browser/image viewer:

- `test-results/layout/contact-1240x900.png` and `contact-1440x900.png` —
  single vertical flow (eyebrow, h1, intro, one action row), snapshot
  heading directly below with only the neutral hairline, weighted ledger
  rows unchanged.
- `contact-1024x768.png` and `contact-721x900.png` — tablet stacked flow,
  no ink rule above the snapshot heading, tablet ledger rhythm unchanged.
- `contact-720x900.png` and `contact-390x844.png` — visually identical to
  the shipped mobile design, including the ink top rule on the snapshot
  heading.
- `contact-1240x900-text-200.png` — 200% root text: content visible, no
  clipped groups, actions still one row (per D-01 measurement).

Report any visual divergence from the spec's expected outcome as a failure
of this task; do not hand-wave.

- [ ] **Step 2: Diff hygiene**

Run: `git diff --check`
Expected: PASS, no whitespace errors.

Run: `git diff --stat -- app/globals.css scripts/layout-check.mjs`
Expected: only these two files changed, deletions outweigh additions.

- [ ] **Step 3: Optional — deterministic lint pass (needs Nathan approval)**

`npx impeccable detect <served-local-url>` requires network. Ask Nathan
before running. If run, judge findings against the project authority
(`DESIGN.md`, `visual-taste.md`, `.impeccable/config.json` waivers), not as
raw mandates.

---

## Spec coverage map

| Requirement | Task / assertion |
| --- | --- |
| FR-03 single-flow desktop | Task 1 Step 3 (hero above Details at ≥721, shared start edge + one action row at ≥1240) |
| FR-05 tablet upper flow | Task 1 Step 3 (`width >= 721` hero-above-Details assertion) |
| FR-10 zone connection | Task 1 Steps 1+3 (borderBottom 0, heading borderTop width-dependent) |
| FR-04/FR-06 ledger unchanged | untouched existing assertions (spans, rows, borders, zero gaps) |
| FR-07 mobile preservation | Task 1 Steps 1+3 mobile expectations; Task 3 Step 1 screenshots |
| NFR-09 implementation economy | Task 1 Step 4 source checks; Task 3 Step 2 diff stat |
| AC-02/AC-04/AC-06/AC-08 | Task 1 Steps 1–3 |
| AC-13 deletion proof | Task 1 Step 4 |
| AC-10/AC-11 overflow + 200% | existing CONTACT_VIEWPORTS / CONTACT_TEXT_VIEWPORTS loops, unchanged |
| AC-12 compact footer | existing contract + layout assertions, unchanged |

## Execution routes

- **Inline** — `executing-plans` runs Tasks 1–3 in this session with
  checkpoints after each task.
- **Delegated** — `codex-build` freezes this plan as the spec for Codex in a
  write sandbox; diff reviewed before any commit.

No commit step is included; committing requires Nathan's explicit request.
