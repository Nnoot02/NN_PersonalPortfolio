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

function readBytes(base, path) {
  try {
    return readFileSync(new URL(`../${base}${path}`, import.meta.url));
  } catch {
    return null;
  }
}

function renderedMain(markup) {
  return markup.match(/<main[\s\S]*?<\/main>/)?.[0] ?? markup;
}

function normalizeTextEntities(markup) {
  return markup.replaceAll("&#x27;", "'").replaceAll("&#39;", "'");
}

const home = renderedMain(readExport("/index.html"));
const about = normalizeTextEntities(renderedMain(readExport("/about.html")));
const contact = renderedMain(readExport("/contact.html"));
const resume = readExport("/resume.html");
const profile = readExport("/profile.html");
const projectsIndex = renderedMain(readExport("/projects.html"));
const workbench = renderedMain(readExport("/workbench.html"));
const sitemap = readExport("/sitemap.xml");
const projectIndexSource = readFileSync(new URL("../lib/project-index.ts", import.meta.url), "utf8");
const projectsSource = readFileSync(new URL("../lib/projects.ts", import.meta.url), "utf8");
const globalsCss = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

check(home.includes("Electrical engineering student · Adelaide"), "home hero eyebrow must state electrical-engineering student and Adelaide");
check(home.includes("Power systems and grid integration"), "home hero must state power-systems and grid-integration positioning");
check(home.includes("I design to AS/NZS standards and publish the working, so please feel free to check it."), "home hero must use approved standards-and-published-working copy");
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
check(heroMedia.includes("/images/lv-cabling-sld.svg"), "home hero must use the LV cabling single-line diagram");
check(!heroMedia.includes("miniature") && !heroMedia.includes("generated_images"), "home hero must exclude miniature content");
check((heroMedia.match(/<a\b/g) ?? []).length === 0, "home hero media must remain passive");
check(heroMedia.includes('loading="eager"') && heroMedia.includes('fetchPriority="high"'), "home hero image must load eagerly at high fetch priority");

const hero = home.match(/<section[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
check(hero.includes("Production Worker, Tindo Solar") && hero.includes("Nov 2025"), "home hero must contain the current-role credential as labelled fields");
check((home.match(/Tindo Solar/g) ?? []).length === 1, "home must mention Tindo Solar once, inside the hero credential");
check(!home.includes("tindo-strip"), "home must not render standalone Tindo section");
check(!home.includes("Some project evidence remains pending where marked."), "home must not show global evidence-pending warning");
check(/href="\/nathan-noot-electrical-embedded-resume\.pdf"[^>]*target="_blank"/.test(home), "home must offer the resume in a new tab");
check(/href="\/nathan-noot-electrical-embedded-resume\.pdf"[^>]*target="_blank"/.test(resume), "resume page must offer the resume in a new tab");

// nathan-noot-general-resume.pdf is a deliberate orphan with no inbound link. It
// keeps the pre-rename URL alive for anyone who was already sent it; a static
// export has no redirect layer. It is intentional, not dead weight, so do not
// delete it. A stale copy is worse than a 404 because it serves an outdated
// resume, so pin it to the canonical file and prove it actually ships.
const canonicalResumeBytes = readBytes("public", "/nathan-noot-electrical-embedded-resume.pdf");
const aliasResumeBytes = readBytes("public", "/nathan-noot-general-resume.pdf");
const exportedAliasBytes = readBytes("out", "/nathan-noot-general-resume.pdf");
check(canonicalResumeBytes !== null && aliasResumeBytes !== null && aliasResumeBytes.equals(canonicalResumeBytes), "the pre-rename resume alias must stay byte-identical to the canonical resume");
check(canonicalResumeBytes !== null && exportedAliasBytes !== null && exportedAliasBytes.equals(canonicalResumeBytes), "the pre-rename resume alias must ship in the static export");
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
check(epilogue.includes("Other systems"), "home epilogue must expose its collection heading");
check(!epilogue.includes("Beyond the ledger"), "home epilogue must not retain the redundant Beyond the ledger kicker");
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
check(workbenchPortal.includes("/images/workbench/bench-fume-extractor/bench-fume-extractor.webp"), "Workbench portal must use approved authentic fume-extractor photo");
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
check(footer.includes("Ask me about my work."), "footer must use approved ask-about-my-work lead");
check(footer.includes("Available for South Australian internships."), "footer must use approved internship availability support");
for (const destination of ["/contact", "/projects", "/workbench", "/profile"]) {
  check(footer.includes(`href="${destination}"`), `footer must link ${destination}`);
}
check(/href="\/nathan-noot-electrical-embedded-resume\.pdf"[^>]*target="_blank"/.test(footer), "footer must offer the resume in a new tab");
check(footer.includes("linkedin.com"), "footer must provide LinkedIn action");
check(footer.includes("github.com/Nnoot02") && footer.includes("GitHub"), "footer must render the configured GitHub action");
const footerAnchors = [...footer.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
const footerUtilityLinkIndex = footerAnchors.findIndex((anchor) => anchor.includes("data-footer-utility"));
check(footerUtilityLinkIndex === footerAnchors.length - 1, "footer recruiter utility must remain the final and quiet action");

const aboutStory = about.match(/<section[^>]*class="about-story"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
const aboutTools = about.match(/<section[^>]*id="tools-and-standards"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
const aboutIntroduction = "I became a chef to help people, then chose engineering to pursue net zero and Australia's energy dominance through solar.";
const previousAboutIntroduction = "I am an electrical engineering student in Adelaide focused on solar power systems and grid integration. My work is grounded in standards-based design and Australian solar manufacturing experience.";
const manufacturingEvidence = "At Tindo Solar, production work gives me direct exposure to solar-panel manufacturing, 5S, Kaizen, quality checks, and fault-finding culture. By shadowing their engineers, I learnt how RCA and 8D problem-solving connect engineering decisions with process reliability and operator reality.";
const benchEvidence = "small systems where limitations stay visible and useful. When I was a chef and was appointed as kitchen supervisor, I learnt how to coordinate teams, train staff, manage stock, and make calm decisions under pressure.";
check(aboutIntroduction.split(/\s+/).length === 20, "about introduction must contain exactly 20 words");
check(about.includes(aboutIntroduction), "about must use the exact approved 20-word introduction");
check(!about.includes(previousAboutIntroduction), "about must not retain the previous introduction");
check(aboutStory.includes('class="about-story-intro"') && aboutStory.includes('class="about-story-grid"'), "about must use the approved compact B story layout");
check(aboutStory.includes("Approach") && aboutStory.includes("Study") && aboutStory.includes("Manufacturing made it practical.") && aboutStory.includes("Bench and teams"), "about B layout must expose its three evidence themes");
check(!aboutStory.includes("<ul") && !aboutStory.includes("<li"), "about evidence themes must render paragraphs instead of lists");
check(aboutStory.includes(manufacturingEvidence), "about manufacturing evidence must use approved paragraph copy");
check(aboutStory.includes("Outside work and study, I keep building at the") && aboutStory.includes(benchEvidence), "about bench evidence must use approved paragraph copy");
check(!aboutStory.includes("Work evidence"), "about story must omit the redundant Work evidence kicker");
check(!about.includes("Technical direction"), "about must not retain the duplicated Technical direction section");
check(about.includes('class="about-tools"'), "about must retain Tools and standards as the technical inventory");
check(about.includes('id="tools-and-standards-heading">Tools and standards</h2>'), "about tools inventory must use Tools and standards as its headline");
check(!about.includes("What I have actually used.") && !about.includes("Nothing is listed here"), "about tools inventory must omit implicit supporting copy");
check(aboutTools.includes("data-tools-desktop-network"), "about must render the desktop project-centred network");
check(aboutTools.includes("data-tools-mobile-proof"), "about must render the mobile proof-led ledger");
check(aboutTools.includes("data-tools-detail-rail"), "about desktop network must include its bottom detail rail");
check(!aboutTools.includes("data-capability-list"), "about must not retain the ungrounded flat capability list");
const defaultProjectNode = aboutTools.match(/<button[^>]*data-node-id="lv"[^>]*>/)?.[0] ?? "";
check(defaultProjectNode.includes('aria-pressed="true"'), "about desktop network must select Commercial LV cabling by default");
for (const evidenceState of ["verified", "associated", "pending"]) {
  check(aboutTools.includes(`data-state="${evidenceState}"`), `about desktop network must expose ${evidenceState} evidence links`);
}
for (const projectSlug of [
  "lv-cabling-design-commercial-complex",
  "solar-grid-connection-assessment",
  "gps-denied-autonomous-uav",
  "solar-manufacturing-dfma",
]) {
  check(aboutTools.includes(`/projects/${projectSlug}`), `about Tools and standards must link to ${projectSlug}`);
}
for (const mobileCapability of ["Power design", "Grid connection", "Embedded systems", "Manufacturing and quality"]) {
  check(aboutTools.includes(`>${mobileCapability}</h3>`), `about mobile proof ledger must expose ${mobileCapability}`);
}
for (const toolEvidence of [
  "AS/NZS 3000",
  "AS/NZS 3008.1.1",
  "AS/NZS 4777.1 and 4777.2",
  "AS/NZS 5033",
  "SA Power Networks TS132/TS133/TS134",
  "AS 1100 technical drawing",
  "Maximum demand",
  "earth-fault-loop impedance",
  "AutoCAD",
  "Autodesk Inventor",
  "Fusion 360",
  "KiCad",
  "Multimeter",
  "oscilloscope",
  "function generator",
  "LTspice",
  "Logisim",
  "Python",
  "MATLAB",
  "ROS 2",
  "MAVLink telemetry",
  "5S",
  "Kaizen",
  "root cause analysis",
  "8D problem-solving",
  "inspection",
  "soldering",
]) {
  check(aboutTools.includes(toolEvidence), `about Tools and standards must retain: ${toolEvidence}`);
}
check(globalsCss.includes(".tools-proof-mobile { display: none; }"), "desktop must hide the mobile proof ledger");
check(globalsCss.includes(".tools-network-desktop, .tools-network-desktop-only { display: none; }"), "mobile must hide the desktop network");
check(globalsCss.includes(".tools-proof-mobile { display: block; }"), "mobile must show the proof-led ledger");
const contactIntro = "Adelaide-based electrical engineering student open to placements, internships, and project conversations, especially around power systems, grid integration, and practical electrical engineering.";
const contactSnapshot = contact.match(/<aside[^>]*data-technical-snapshot[^>]*>[\s\S]*?<\/aside>/)?.[0] ?? "";
const contactFooter = contact.match(/<footer[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? "";
check(contact.includes('class="page-hero contact-hero contact-hero--compact"'), "contact must use the compact hero treatment");
check(contact.includes('<p class="eyebrow">CONTACT</p>'), "contact must use the approved CONTACT eyebrow");
check(contact.includes("EMAIL WORKS BEST."), "contact must use the approved email-first hero");
check(contact.includes(contactIntro), "contact must use the exact approved intro");
check(contact.includes('href="mailto:nathannoott@gmail.com"'), "contact must make the visible email the primary mailto action");
check(contact.includes("Copy address"), "contact must label copy as Copy address");
check(contactSnapshot.length > 0, "contact must expose Technical Snapshot");
const snapshotGroups = [...contactSnapshot.matchAll(/data-snapshot-group="([^"]+)"/g)].map((match) => match[1]);
check(snapshotGroups.join(",") === "current-role,studying,verified-power,current-build,path", "contact snapshot groups must remain in locked order");
for (const snapshotValue of [
  "Production Worker · Tindo Solar",
  "Associate Degree in Electronics Engineering · TAFE SA",
  "GPS-denied autonomous UAV",
  "SITL / ROS 2 setup + subsystem validation",
  "Commercial kitchens → power systems",
]) {
  check(contactSnapshot.includes(snapshotValue), "contact snapshot must retain: " + snapshotValue);
}
check(contactSnapshot.includes('href="/projects/lv-cabling-design-commercial-complex"') && contactSnapshot.includes("400 V commercial LV design ↗"), "contact snapshot must link verified LV work");
check(contactSnapshot.includes('href="/projects/solar-grid-connection-assessment"') && contactSnapshot.includes("1 MW grid assessment ↗"), "contact snapshot must link verified grid work");
check(contactFooter.includes('data-footer-variant="compact"'), "contact must render compact footer variant");
for (const compactFooterText of ["NATHAN NO-OT · ADELAIDE, SA", "Projects", "LinkedIn", "Résumé", "Workbench"]) {
  check(contactFooter.includes(compactFooterText), "compact contact footer must include: " + compactFooterText);
}
for (const forbiddenContactText of ["Contact", "Fact sheet", "Ask me about my work.", "nathannoott@gmail.com", "Nov 2026", "Grad:", "SPEC-2026", "STANDARDS & TOOLING"]) {
  check(!contactFooter.includes(forbiddenContactText), "compact contact footer must omit: " + forbiddenContactText);
}
check(!contact.includes("Let's discuss engineering work."), "contact must not retain the old hero");
check(!contact.includes("Flight evidence pending"), "contact must not add unsupported flight evidence");

check(!projectsIndex.includes("Power · verification"), "projects hero must remove the old scope eyebrow");
check(projectsIndex.includes("I learn by taking systems from theory towards proof."), "projects hero must use approved headline");
check(projectsIndex.includes("Each project shows what I decided, what I produced, and where the evidence currently stops."), "projects hero must use approved evidence-boundary copy");
check(!projectsIndex.includes("—"), "projects public copy must contain no em dash");

const projectJourneys = projectsIndex.match(/<ol[^>]*data-project-journeys[^>]*>[\s\S]*?<\/ol><\/section>/)?.[0] ?? "";
check(projectJourneys.length > 0, "projects page must expose semantic project journeys");
const projectJourneySlugs = [...projectJourneys.matchAll(/data-project-slug="([^"]+)"/g)].map((match) => match[1]);
const expectedProjectJourneySlugs = [
  "lv-cabling-design-commercial-complex",
  "solar-grid-connection-assessment",
  "gps-denied-autonomous-uav",
];
check(projectJourneySlugs.join(",") === expectedProjectJourneySlugs.join(","), "projects journey DOM order must be LV, Solar, UAV");
for (const slug of expectedProjectJourneySlugs) {
  check(projectJourneys.includes('href="/projects/' + slug + '"'), slug + " journey lane must target its detail route");
}
const projectJourneyAnchors = [...projectJourneys.matchAll(/<a\b[^>]*data-project-journey-link[^>]*>[\s\S]*?<\/a>/g)];
check(projectJourneyAnchors.length === 3, "projects journeys must contain exactly three destination links");
check((projectJourneys.match(/data-journey-stage=/g) ?? []).length === 9, "projects journeys must expose exactly nine stage states");
const expectedProjectJourneyStages = new Map([
  ["lv-cabling-design-commercial-complex", ["Theory:resolved:AS/NZS requirements", "System decision:resolved:400 V cable and protection design", "Verification:resolved:Voltage drop and fault checks"]],
  ["solar-grid-connection-assessment", ["Theory:resolved:SAPN and AS/NZS requirements", "System decision:resolved:LV and HV connection options", "Verification:resolved:Hosting-capacity conclusion"]],
  ["gps-denied-autonomous-uav", ["Planning:resolved:Requirements and architecture", "Current frontier:current:Hardware and software integration", "Verification:future:Staged tests and measured results"]],
]);
for (const [slug, expectedStages] of expectedProjectJourneyStages) {
  const lane = projectJourneys.match(new RegExp('(<li[^>]*data-project-slug="' + slug + '"[\\s\\S]*?)(?=<li[^>]*data-project-slug=|<\\/ol>)'))?.[1] ?? "";
  const renderedStages = [...lane.matchAll(/<li\b[^>]*data-journey-stage="([^"]+)"[^>]*>[\s\S]*?<span[^>]*class="project-journey-stage-label"[^>]*>([^<]+)<\/span>[\s\S]*?<small[^>]*>([^<]+)<\/small>/g)]
    .map((match) => match[2] + ":" + match[1] + ":" + match[3]);
  check(renderedStages.join(",") === expectedStages.join(","), slug + " journey labels, details, and evidence states must match");
}

const projectSpecificAltTerms = new Map([
  ["lv-cabling-design-commercial-complex", "lv cabling"],
  ["solar-grid-connection-assessment", "solar grid-connection"],
  ["gps-denied-autonomous-uav", "uav"],
]);
const projectMiniatureAlts = [];
for (const [slug, requiredTerm] of projectSpecificAltTerms) {
  const lane = projectJourneys.match(new RegExp('(<li[^>]*data-project-slug="' + slug + '"[\\s\\S]*?)(?=<li[^>]*data-project-slug=|<\\/ol>)'))?.[1] ?? "";
  const alt = lane.match(/<img\b[^>]*\balt="([^"]*)"/)?.[1]?.trim() ?? "";
  projectMiniatureAlts.push(alt);
  check(alt.length > 0, `${slug} miniature alt text must be non-empty`);
  check(alt.toLowerCase().includes(requiredTerm), `${slug} miniature alt text must be project-specific`);
}
check(new Set(projectMiniatureAlts).size === expectedProjectJourneySlugs.length, "project miniature alt text must be unique per project");

check(projectIndexSource.includes("satisfies ProjectIndexDefinitions"), "project-index definitions must use an exact keyed type");
check(projectIndexSource.includes("projectIndexSlugs.map((slug)"), "project-index entries must iterate the authoritative slug order");
check(!projectIndexSource.includes('"esp32-drone"'), "project-index source must not retain the ESP32 project slug");
check(!projectsSource.includes('slug: "esp32-drone"'), "project data must not retain the ESP32 project route");

const projectRelations = [...projectsIndex.matchAll(/data-project-relation/g)];
const projectRelation = projectsIndex.match(/<p[^>]*data-project-relation[^>]*>[\s\S]*?<\/p>/)?.[0] ?? "";
check(projectRelations.length === 1, "projects page must expose exactly one project relationship");
check(projectRelation.includes('data-source-slug="lv-cabling-design-commercial-complex"') && projectRelation.includes('data-target-slug="solar-grid-connection-assessment"'), "projects relationship must name only LV and Solar endpoints");
check(projectRelation.includes("standards + verification"), "projects relationship must retain approved label");
check(!projectsIndex.includes("embedded control + staged testing"), "projects page must remove the stale ESP32 relationship");

check(!projectsIndex.includes("buildability + physical systems"), "projects page must remove buildability relationship");
check(!projectsIndex.includes("Manufacturing lens"), "projects page must remove manufacturing lens");
check(!projectsIndex.includes("Solar module production gives me practical context"), "projects page must remove manufacturing-lens copy");
check(!projectIndexSource.includes("projectIndexRelations") && !projectIndexSource.includes("manufacturingLens"), "project-index source must remove retired Projects exports");
check(projectIndexSource.includes("projectIndexRelation") && projectIndexSource.includes('sourceSlug: "lv-cabling-design-commercial-complex"'), "project-index source must expose singular LV-to-Solar relationship");
check(!projectJourneys.includes("solar-manufacturing-dfma"), "manufacturing entry must not appear in project journeys");

// Internal editorial scaffolding leaked to production on two case-study routes
// (audit 2026-08-07, P1). Case-study evidence state is public copy only.
const caseStudySlugs = [...projectsSource.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]);
check(caseStudySlugs.length > 0, "project data must declare at least one case-study slug");
for (const slug of caseStudySlugs) {
  const caseStudy = renderedMain(readExport(`/projects/${slug}.html`));
  check(!/Evidence interview required|Content gate/i.test(caseStudy), `${slug} must not publish internal content-gate scaffolding`);
  check(!caseStudy.includes("Replace this panel"), `${slug} must not publish internal editorial instructions`);
}

// The one-line diagram is unreadable at mobile widths without the full-size file.
const lvCaseStudy = renderedMain(readExport("/projects/lv-cabling-design-commercial-complex.html"));
const fullSizeDiagramLink = lvCaseStudy.match(/<a\b[^>]*href="\/images\/lv-cabling-sld\.svg"[^>]*>/)?.[0] ?? "";
check(fullSizeDiagramLink.length > 0, "LV case study must link the full-size one-line diagram");
check(fullSizeDiagramLink.includes('target="_blank"') && fullSizeDiagramLink.includes("noopener"), "full-size diagram link must open in a new tab with noopener");

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
