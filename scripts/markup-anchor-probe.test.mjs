// scripts/markup-anchor-probe.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { classify, exitCode, ANCHOR_SPEC } from "./markup-anchor-probe.mjs";

// A minimal conformant homepage: every marker the spec pins, 46 plot leaves inside
// the hero figure (the count is SCOPED to that figure, exactly like the contract's
// own heroMedia slice). The canonical root carries NO trailing slash (measured live
// and in the export: app/layout.tsx sets `alternates: { canonical: "./" }`).
const GOOD =
  '<html><head><link rel="canonical" href="https://nnoott.com"></head><body>' +
  '<a class="wordmark-home" href="/">NN.</a>' +
  '<nav id="primary-navigation"></nav>' +
  '<main id="main-content"><section id="verified-work"></section>' +
  '<figure class="hero-image">' + '<path pathLength="1"/>'.repeat(46) + "</figure>" +
  "</main></body></html>";

test("a conformant homepage passes every check", () => {
  assert.deepEqual(classify(GOOD, ANCHOR_SPEC["/"]), []);
});

test("a renamed landmark is caught, and the finding names it", () => {
  const html = GOOD.replace('id="primary-navigation"', 'id="primary-nav"');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /navigation/);
});

test("a renamed main landmark is caught", () => {
  const html = GOOD.replace('id="main-content"', 'id="content"');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /main landmark/);
});

test("a renamed wordmark link is caught", () => {
  const html = GOOD.replace('class="wordmark-home"', 'class="wordmark"');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /wordmark/);
});

test("a renamed verified-work band is caught", () => {
  const html = GOOD.replace('id="verified-work"', 'id="verified"');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /verified-work/);
});

test("a canonical href without rel=canonical is NOT accepted (literal rel-less form)", () => {
  const html = GOOD.replace('<link rel="canonical" href="https://nnoott.com">', '<link href="https://nnoott.com">');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /canonical/);
});

test("a removed canonical element is caught", () => {
  const html = GOOD.replace('<link rel="canonical" href="https://nnoott.com">', "");
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /canonical/);
});

test("a wrong canonical host is caught", () => {
  const html = GOOD.replace('href="https://nnoott.com"', 'href="https://www.nnoott.com"');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /canonical/);
});

test("the leaf count is exact: 47 leaves is caught", () => {
  const html = GOOD.replace("</figure>", '<path pathLength="1"/></figure>');
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].detail, "count 47 != 46");
});

test("the leaf count is scoped: leaves outside the hero figure do not count", () => {
  const html = GOOD.replace("</main>", '<svg><path pathLength="1"/><path pathLength="1"/></svg></main>');
  assert.deepEqual(classify(html, ANCHOR_SPEC["/"]), []);
});

test("a missing hero figure reads as count 0, not as a pass", () => {
  const html = GOOD.replace(/<figure class="hero-image">[\s\S]*?<\/figure>/, "");
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].detail, "count 0 != 46");
});

test("a short leaf count is caught with both numbers", () => {
  const html = GOOD.replace('<path pathLength="1"/>', "");
  const findings = classify(html, ANCHOR_SPEC["/"]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].detail, "count 45 != 46");
});

const SUB_ROUTES = ["/projects", "/profile", "/projects/solar-grid-connection-assessment"];
// Literal expected labels, NOT read off ANCHOR_SPEC: a spec whose label was mis-edited must fail
// this arm, so the expectation cannot come from the object under test. The homepage's four marker
// labels are pinned here too -- a loose substring arm lets a mis-edited label survive.
const EXPECTED_LABELS = {
  "/": [
    "canonical href is the origin root",
    "main landmark",
    "primary navigation",
    "wordmark home link",
    "verified-work band",
    "hero plot leaves",
  ],
  "/projects": ["canonical href is /projects", "main landmark"],
  "/profile": ["canonical href is /profile", "main landmark"],
  "/projects/solar-grid-connection-assessment": ["canonical href is the project page", "main landmark"],
};

test("every sub-route spec passes on its own conformant page", () => {
  for (const route of SUB_ROUTES) {
    const html = `<html><head><link rel="canonical" href="https://nnoott.com${route}"></head><body><main id="main-content"></main></body></html>`;
    assert.deepEqual(classify(html, ANCHOR_SPEC[route]), [], route);
  }
});

test("every sub-route spec catches its own canonical drift", () => {
  for (const route of SUB_ROUTES) {
    const html = `<html><head><link rel="canonical" href="https://nnoott.com/work"></head><body><main id="main-content"></main></body></html>`;
    const findings = classify(html, ANCHOR_SPEC[route]);
    assert.equal(findings.length, 1, route);
    assert.equal(findings[0].label, EXPECTED_LABELS[route][0], route);
  }
});

test("a sub-route landmark mutation is caught", () => {
  const html = `<html><head><link rel="canonical" href="https://nnoott.com/profile"></head><body><main id="content"></main></body></html>`;
  const findings = classify(html, ANCHOR_SPEC["/profile"]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].label, /main landmark/);
});

test("an unknown check kind is reported, never silently skipped", () => {
  const findings = classify(GOOD, [{ kind: "wat", label: "bogus" }]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].detail, /unknown kind wat/);
});

test("every spec label matches the literal label map", () => {
  for (const [route, labels] of Object.entries(EXPECTED_LABELS)) {
    assert.deepEqual(ANCHOR_SPEC[route].map((c) => c.label), labels, route);
  }
});

test("drift takes precedence over a fetch failure in the exit code", () => {
  assert.equal(exitCode({ drifted: true, fetchFailed: true }), 1);
  assert.equal(exitCode({ drifted: true, fetchFailed: false }), 1);
  assert.equal(exitCode({ drifted: false, fetchFailed: true }), 2);
  assert.equal(exitCode({ drifted: false, fetchFailed: false }), 0);
});
