import { existsSync, readFileSync, statSync } from "node:fs";

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function publicFileSize(path) {
  try {
    return statSync(new URL(`../public${path}`, import.meta.url)).size;
  } catch {
    failures.push(`missing public asset ${path}`);
    return Number.POSITIVE_INFINITY;
  }
}

function readExport(path) {
  try {
    return readFileSync(new URL(`../out${path}`, import.meta.url), "utf8");
  } catch {
    failures.push(`missing static export ${path}; implement the route and run pnpm build`);
    return "";
  }
}

function renderedMain(markup) {
  return markup.match(/<main[\s\S]*?<\/main>/)?.[0] ?? markup;
}

const home = renderedMain(readExport("/index.html"));
const resume = readExport("/resume.html");
const profile = readExport("/profile.html");
const projectsIndex = renderedMain(readExport("/projects.html"));
const workbench = renderedMain(readExport("/workbench.html"));
const sitemap = readExport("/sitemap.xml");
const projectIndexSource = readFileSync(new URL("../lib/project-index.ts", import.meta.url), "utf8");
const projectsSource = readFileSync(new URL("../lib/projects.ts", import.meta.url), "utf8");

check(home.includes("Electrical engineering student · Adelaide"), "home hero eyebrow must state electrical-engineering student and Adelaide");
check(home.includes("Power systems and grid integration"), "home hero must state power-systems and grid-integration positioning");
check(home.includes("I design from standards and verify decisions with calculations, backed by Australian solar-manufacturing experience."), "home hero must use approved comma-separated standards-and-manufacturing copy");
check(!home.includes("calculations—backed"), "home hero must not retain the em-dash summary");
check(home.includes("Nathan") && home.includes("No-ot"), "home hero must render Nathan No-ot");
const homeWordmark = home.match(/<a[^>]*class="wordmark"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
const resumeWordmark = resume.match(/<a[^>]*class="wordmark"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
check(homeWordmark.includes('class="wordmark-home"'), "home wordmark must use homepage identity treatment");
check(homeWordmark.includes("NN") && homeWordmark.includes('class="wordmark-period"'), "home wordmark must render NN. with accent period");
check(!homeWordmark.includes("Nathan No-ot"), "home wordmark must not repeat full hero name");
check(resumeWordmark.includes('class="wordmark-desktop"') && resumeWordmark.includes("Nathan No-ot"), "non-home desktop wordmark must render Nathan No-ot");
check(resumeWordmark.includes('class="wordmark-mobile"') && resumeWordmark.includes("NN") && resumeWordmark.includes('class="wordmark-period"'), "non-home mobile wordmark must render NN. with accent period");
const heroMedia = home.match(/<figure[^>]*class="hero-image"[^>]*>[\s\S]*?<\/figure>/)?.[0] ?? "";
check(heroMedia.length > 0, "home must expose hero media figure");
check(heroMedia.includes("/images/lv-cabling-design.webp"), "home hero must use LV cabling artifact");
check(!heroMedia.includes("miniature") && !heroMedia.includes("generated_images"), "home hero must exclude miniature content");
check((heroMedia.match(/<a\b/g) ?? []).length === 0, "home hero media must remain passive");

const hero = home.match(/<section[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
check(hero.includes("Production Worker, Tindo Solar") && hero.includes("Nov 2025"), "home hero must contain the current-role credential as labelled fields");
check((home.match(/Tindo Solar/g) ?? []).length === 1, "home must mention Tindo Solar once, inside the hero credential");
check(!home.includes("tindo-strip"), "home must not render standalone Tindo section");
check(!home.includes("Some project evidence remains pending where marked."), "home must not show global evidence-pending warning");
check(/href="\/nathan-noot-general-resume\.pdf"[^>]*download/.test(home), "home must provide resume PDF download");
check(/href="\/nathan-noot-general-resume\.pdf"[^>]*download/.test(resume), "resume page must provide resume PDF download");
check(profile.includes("Electrical engineering student focused on solar power systems and grid integration"), "profile must use solar student positioning");
check(profile.includes('content="Plain-text profile for electrical-engineering student and internship opportunities in solar power systems and grid integration."'), "profile metadata must use solar student positioning");
check(home.includes('id="primary-navigation"'), "primary navigation must expose id for mobile aria-controls");
check(home.includes('aria-controls="primary-navigation"'), "menu button must control primary navigation");

const navMatch = home.match(/<nav[^>]*id="primary-navigation"[\s\S]*?<\/nav>/);
if (navMatch) {
  const destinations = [...navMatch[0].matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  check(destinations.join(",") === "/,/projects,/about,/contact", "primary navigation must contain Home, Projects, About, Contact only");
}

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

check(home.includes("Power Systems Work"), "home must replace Evidence ledger with Power Systems Work");
check(!home.includes("Evidence ledger"), "home must not retain the clinical Evidence ledger title");
check(!home.includes("View verified work"), "home must not retain View verified work");

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
check(!navMatch || !navMatch[0].includes('href="/workbench"'), "Workbench must not enter primary navigation");
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

check(projectsIndex.includes("Power · verification"), "projects hero must expose approved scope eyebrow");
check(projectsIndex.includes("I learn by taking systems from theory towards proof."), "projects hero must use approved headline");
check(projectsIndex.includes("Each project shows what I decided, what I produced, and where the evidence currently stops."), "projects hero must use approved evidence-boundary copy");
check(!projectsIndex.includes("—"), "projects public copy must contain no em dash");

const projectAtlas = projectsIndex.match(/<ol[^>]*data-project-atlas[^>]*>[\s\S]*?<\/ol>(?=<\/div><ul class="project-relations")/)?.[0] ?? "";
check(projectAtlas.length > 0, "projects page must expose semantic project atlas");
const projectAtlasSlugs = [...projectAtlas.matchAll(/data-project-slug="([^"]+)"/g)].map((match) => match[1]);
const expectedProjectAtlasSlugs = [
  "lv-cabling-design-commercial-complex",
  "solar-grid-connection-assessment",
  "gps-denied-autonomous-uav",
];
check(projectAtlasSlugs.join(",") === expectedProjectAtlasSlugs.join(","), "projects atlas DOM order must be LV, Solar, UAV");
for (const slug of expectedProjectAtlasSlugs) {
  check(projectAtlas.includes(`href="/projects/${slug}"`), `${slug} atlas portal must target its detail route`);
}
const projectPortalAnchors = [...projectAtlas.matchAll(/<a\b[^>]*data-project-portal-link[^>]*>[\s\S]*?<\/a>/g)];
check(projectPortalAnchors.length === 3, "projects atlas must contain exactly three portal anchors");
check((projectAtlas.match(/data-journey-stage=/g) ?? []).length === 9, "projects atlas must expose exactly three stages for each of three portals");
const expectedProjectJourneyStages = new Map([
  ["lv-cabling-design-commercial-complex", ["Theory:resolved", "System decision:resolved", "Verification:resolved"]],
  ["solar-grid-connection-assessment", ["Theory:resolved", "System decision:resolved", "Verification:resolved"]],
  ["gps-denied-autonomous-uav", ["Planning:resolved", "Current frontier:current", "Verification:future"]],
]);
for (const [slug, expectedStages] of expectedProjectJourneyStages) {
  const portal = projectAtlas.match(new RegExp(`<li[^>]*data-project-slug="${slug}"[\\s\\S]*?<\\/article>\\s*<\\/li>`))?.[0] ?? "";
  const renderedStages = [...portal.matchAll(/<li\b[^>]*data-journey-stage="([^"]+)"[^>]*>\s*<span>([^<]+)<\/span>/g)]
    .map((match) => `${match[2]}:${match[1]}`);
  check(renderedStages.join(",") === expectedStages.join(","), `${slug} journey labels and evidence states must match`);
}

const projectSpecificAltTerms = new Map([
  ["lv-cabling-design-commercial-complex", "lv cabling"],
  ["solar-grid-connection-assessment", "solar grid-connection"],
  ["gps-denied-autonomous-uav", "uav"],
]);
const projectMiniatureAlts = [];
for (const [slug, requiredTerm] of projectSpecificAltTerms) {
  const portal = projectAtlas.match(new RegExp(`<li[^>]*data-project-slug="${slug}"[\\s\\S]*?<\\/li>`))?.[0] ?? "";
  const alt = portal.match(/<img\b[^>]*\balt="([^"]*)"/)?.[1]?.trim() ?? "";
  projectMiniatureAlts.push(alt);
  check(alt.length > 0, `${slug} miniature alt text must be non-empty`);
  check(alt.toLowerCase().includes(requiredTerm), `${slug} miniature alt text must be project-specific`);
}
check(new Set(projectMiniatureAlts).size === expectedProjectAtlasSlugs.length, "project miniature alt text must be unique per project");

check(projectIndexSource.includes("satisfies ProjectIndexDefinitions"), "project-index definitions must use an exact keyed type");
check(projectIndexSource.includes("projectIndexSlugs.map((slug)"), "project-index entries must iterate the authoritative slug order");
check(!projectIndexSource.includes('"esp32-drone"'), "project-index source must not retain the ESP32 project slug");
check(!projectsSource.includes('slug: "esp32-drone"'), "project data must not retain the ESP32 project route");

for (const relation of ["standards + verification", "buildability + physical systems"]) {
  check(projectsIndex.includes(relation), `projects page must expose relationship: ${relation}`);
}
check(!projectsIndex.includes("embedded control + staged testing"), "projects page must remove the stale ESP32 relationship");

const manufacturingLensMarkup = projectsIndex.match(/<aside[^>]*data-manufacturing-lens[^>]*>[\s\S]*?<\/aside>/)?.[0] ?? "";
check(manufacturingLensMarkup.includes("Solar module production gives me practical context for buildability, process reliability, and DFMA. Employer-sensitive details stay private."), "projects page must expose approved manufacturing lens");
check((manufacturingLensMarkup.match(/<a\b/g) ?? []).length === 0, "manufacturing lens must not be a project destination");
check(!projectAtlas.includes("solar-manufacturing-dfma"), "manufacturing entry must not appear in project atlas");

const projectIndexAssets = [
  "/images/project-index/lv-cabling-process.webp",
  "/images/project-index/solar-grid-connection-process.webp",
  "/images/project-index/gps-denied-uav-process.webp",
];
for (const asset of projectIndexAssets) {
  check(projectsIndex.includes(asset), `projects atlas must render ${asset}`);
  check(publicFileSize(asset) <= 160 * 1024, `${asset} must not exceed 160 KB`);
}
check(!projectsIndex.includes(".superpowers") && !projectsIndex.includes("generated_images"), "projects page must not reference disposable generated assets");
check(!existsSync(new URL("../public/images/project-index/esp32-drone-process.webp", import.meta.url)), "obsolete ESP32 project-index miniature must be removed");
check(!existsSync(new URL("../public/images/esp32-drone.webp", import.meta.url)), "obsolete ESP32 project image must be removed");
check(!existsSync(new URL("../out/projects/esp32-drone.html", import.meta.url)), "static export must not retain the ESP32 project route");

const workbenchEntries = [...workbench.matchAll(/data-workbench-entry(?:=\"[^\"]*\")?/g)];
check(workbench.includes("data-workbench-collection"), "Workbench collection must expose its semantic marker");
check(workbenchEntries.length >= 4 && workbenchEntries.length <= 6, "Workbench collection must contain 4-6 publishable entries");
check(workbench.includes("I spend a lot of spare time at my bench building things"), "Workbench collection must use the approved introduction");
check((workbench.match(/data-build-type/g) ?? []).length === workbenchEntries.length, "each Workbench collection entry must expose a build-type marker");

const detailSlugs = [...new Set([...workbench.matchAll(/href=\"\/workbench\/([^\"]+)\"/g)].map((match) => match[1]))];
check(detailSlugs.length === workbenchEntries.length, "Workbench collection must link once to every detail page");
for (const slug of detailSlugs) {
  const detail = renderedMain(readExport(`/workbench/${slug}.html`));
  check(detail.includes("data-build-type"), `${slug} detail page must expose a build-type marker`);
  check(detail.includes("data-workbench-evidence"), `${slug} detail page must expose owned evidence`);
  check(detail.includes("data-workbench-reflection"), `${slug} detail page must expose motivation, contribution, outcome, failure, and next iteration`);
  if (detail.includes('data-requires-source="true"')) {
    check(detail.includes("data-source-attribution"), `${slug} attributed detail page must expose source attribution`);
    check(/data-source-attribution[\s\S]*?href=\"https?:\/\//.test(detail), `${slug} attributed detail page must link its canonical source`);
  }
}

check(sitemap.includes("/workbench"), "sitemap must include the Workbench collection");
check(!workbench.includes("ESP32 Drone Reproduction"), "Workbench must not publish ESP32 before owned evidence exists");
check(!sitemap.includes("/projects/esp32-drone"), "sitemap must not include the retired ESP32 project route");
check(!sitemap.includes("/workbench/esp32-drone-reproduction"), "sitemap must not publish the gated ESP32 Workbench route");
for (const slug of detailSlugs) {
  check(sitemap.includes(`/workbench/${slug}`), `sitemap must include ${slug}`);
}

if (failures.length) {
  console.error("Portfolio contract failures:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Portfolio contract checks passed.");
