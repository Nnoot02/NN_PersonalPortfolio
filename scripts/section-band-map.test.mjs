// scripts/section-band-map.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { extractBands, diffBands, exitCode, exportPath } from "./section-band-map.mjs";

const page = (...bands) => `<html><body><main id="main-content">${bands.join("")}</main></body></html>`;
const hero = '<section class="hero"></section>';
const ledger = '<section class="featured evidence-ledger-section"></section>';
const work = '<section id="verified-work"></section>';
const epilogue = '<section class="homepage-epilogue"></section>';
const GOOD = page(hero, ledger, work, epilogue);

test("bands extract in document order, id before first class", () => {
  assert.deepEqual(extractBands(GOOD), ["hero", "featured", "verified-work", "homepage-epilogue"]);
});

test("nested sections are not bands", () => {
  const html = page(hero.replace("</section>", '<section class="inner"></section></section>'), ledger);
  assert.deepEqual(extractBands(html), ["hero", "featured"]);
});

test("a self-closing section does not open a band that swallows the rest", () => {
  const html = page('<section class="solo"/>', hero, ledger);
  assert.deepEqual(extractBands(html), ["solo", "hero", "featured"]);
});

test("a section-like custom element is not a band", () => {
  const html = page("<section-header></section-header>", hero);
  assert.deepEqual(extractBands(html), ["hero"]);
});

test("a section with no id or class falls back to the key 'section'", () => {
  assert.deepEqual(extractBands(page("<section></section>", hero)), ["section", "hero"]);
});

test("id wins over class when one tag carries both (the homepage's own shape)", () => {
  const both = '<section class="featured evidence-ledger-section" id="verified-work"></section>';
  assert.deepEqual(extractBands(page(hero, both, epilogue)), ["hero", "verified-work", "homepage-epilogue"]);
});

test("identical band sequences diff clean", () => {
  const d = diffBands(extractBands(GOOD), extractBands(GOOD));
  assert.deepEqual(d, { missing: [], extra: [], reordered: false });
});

test("a dropped band is caught", () => {
  const d = diffBands(extractBands(GOOD), extractBands(page(hero, ledger, epilogue)));
  assert.deepEqual(d.missing, ["verified-work"]);
  assert.equal(d.reordered, false);
});

test("an added band is caught", () => {
  const d = diffBands(extractBands(GOOD), extractBands(page(hero, ledger, work, epilogue, '<section class="promo"></section>')));
  assert.deepEqual(d.extra, ["promo"]);
});

test("a reordered pair is caught", () => {
  const d = diffBands(extractBands(GOOD), extractBands(page(work, hero, ledger, epilogue)));
  assert.equal(d.reordered, true);
});

test("a straddling duplicate is caught as a reorder (equal multiplicities)", () => {
  const d = diffBands(extractBands(page(hero, hero, work)), extractBands(page(hero, work, hero)));
  assert.deepEqual(d.missing, []);
  assert.deepEqual(d.extra, []);
  assert.equal(d.reordered, true);
});

test("a dropped duplicate is caught by count, not hidden by set membership", () => {
  const d = diffBands(extractBands(page(hero, hero, work)), extractBands(page(hero, work)));
  assert.deepEqual(d.missing, ["hero x1"]);
  assert.equal(d.reordered, false);
});

test("an added duplicate is reported with its count", () => {
  const d = diffBands(extractBands(page(hero, work)), extractBands(page(hero, hero, work)));
  assert.deepEqual(d.extra, ["hero x1"]);
  assert.equal(d.reordered, false);
});

test("exportPath maps routes onto Next's static export layout", () => {
  assert.equal(exportPath("/"), "out/index.html");
  assert.equal(exportPath("/projects"), "out/projects.html");
  assert.equal(exportPath("/projects/solar-grid-connection-assessment"), "out/projects/solar-grid-connection-assessment.html");
});

test("drift takes precedence over a read failure in the exit code", () => {
  assert.equal(exitCode({ drifted: true, sourceFailed: true }), 1);
  assert.equal(exitCode({ drifted: true, sourceFailed: false }), 1);
  assert.equal(exitCode({ drifted: false, sourceFailed: true }), 2);
  assert.equal(exitCode({ drifted: false, sourceFailed: false }), 0);
});
