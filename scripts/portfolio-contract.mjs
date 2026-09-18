import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";

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

const homeDoc = readExport("/index.html");
const home = renderedMain(homeDoc);
const aboutDoc = readExport("/about.html");
const about = normalizeTextEntities(renderedMain(aboutDoc));
const contactDoc = readExport("/contact.html");
const contact = renderedMain(contactDoc);
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
const homeWordmark = homeDoc.match(/<a[^>]*class="wordmark"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
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
// The hero figure links to the LV case study at every viewport (decision
// 2026-09-02): on phones the diagram is unreadable and needs somewhere to go.
check((heroMedia.match(/<a\b/g) ?? []).length === 1, "home hero media must contain exactly one link");
const heroAnchor = heroMedia.match(/<a\b[^>]*>/)?.[0] ?? "";
check(heroAnchor.includes('class="hero-artifact"') && heroAnchor.includes('href="/projects/lv-cabling-design-commercial-complex"'), "home hero link must be the artifact and target the LV case study");
// Site screening audit 2026-09-16, F4: the artifact states its name and action
// visibly; the sr-only destination sentence was folded into the caption.
check(heroMedia.includes("Commercial LV cabling design - 400 V, three tenancies"), "home hero must name the artifact visibly");
check(heroMedia.includes('class="hero-artifact-action">Open the case study'), "home hero must show the case-study action without hover");
check(!heroMedia.includes("sr-only"), "home hero must not keep the old sr-only destination sentence");
check(heroMedia.includes('loading="eager"') && heroMedia.includes('fetchPriority="high"'), "home hero image must load eagerly at high fetch priority");

const hero = home.match(/<section[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
check(hero.includes("Electrical Engineering Intern, Tindo Solar") && hero.includes("Aug 2026"), "home hero must contain the current-role credential as labelled fields");
check((home.match(/Tindo Solar/g) ?? []).length === 1, "home must mention Tindo Solar once, inside the hero credential");
// Site screening audit 2026-09-13, finding 1 (Nathan's call, 2026-09-16): the
// hero dates the availability window; the plain-text résumé mirrors the line.
check(hero.includes("<dt>Availability</dt><dd>South Australian internships from 2027</dd>"), "home hero must date the availability window");
check(!home.includes("tindo-strip"), "home must not render standalone Tindo section");
check(!home.includes("Some project evidence remains pending where marked."), "home must not show global evidence-pending warning");
check(/href="\/nathan-noot-resume\.pdf"[^>]*target="_blank"/.test(home), "home must offer the resume in a new tab");
check(/href="\/nathan-noot-resume\.pdf"[^>]*target="_blank"/.test(resume), "resume page must offer the resume in a new tab");

// Both older names (nathan-noot-electrical-embedded-resume.pdf and
// nathan-noot-general-resume.pdf) were retired on Nathan's instruction
// 2026-09-03, aliases included. A static export has no redirect layer, so any
// résumé URL already sent out under either name now 404s; that was the
// explicit, informed choice. Prove the one canonical pair ships.
const canonicalResumeBytes = readBytes("public", "/nathan-noot-resume.pdf");
const exportedResumeBytes = readBytes("out", "/nathan-noot-resume.pdf");
check(canonicalResumeBytes !== null, "the canonical résumé PDF must exist in public/");
check(exportedResumeBytes !== null && exportedResumeBytes.equals(canonicalResumeBytes), "the canonical résumé PDF must ship unchanged in the static export");
check(readBytes("public", "/nathan-noot-general-resume.pdf") === null && readBytes("public", "/nathan-noot-electrical-embedded-resume.pdf") === null, "the retired résumé names must not come back");

// The PDF is generated from the .txt by scripts/build-resume-pdf.mjs, which
// records the source hash it rendered. Before the generator existed the two
// drifted apart and contradicted each other across two plan cycles, so a stale
// PDF is a gate failure, not a footnote. The generator is outside verify
// because verify must not rewrite tracked binaries.
const resumeSourceBytes = readBytes("public", "/nathan-noot-resume.txt");
const recordedResumeHash = readBytes("scripts", "/resume-source.sha256")?.toString("utf8").trim() ?? "";
// LF-normalised, matching the generator: the working tree is CRLF on Windows
// but LF after a fresh checkout, and raw bytes would differ between the two.
const actualResumeHash = resumeSourceBytes ? createHash("sha256").update(resumeSourceBytes.toString("utf8").replace(/\r\n/g, "\n")).digest("hex") : "";
check(recordedResumeHash !== "" && recordedResumeHash === actualResumeHash, "résumé PDF is stale: run `corepack pnpm run build:resume` after editing nathan-noot-resume.txt");
check(profile.includes("Electrical engineering student focused on solar power systems and grid integration"), "profile must use solar student positioning");
check(profile.includes('content="Plain-text profile for electrical-engineering student and internship opportunities in solar power systems and grid integration."'), "profile metadata must use solar student positioning");

// C2: one name for the fact sheet, one spelling for résumé (Nathan's yes,
// 2026-09-03). Routes and file names stay ASCII; only the visible words move.
check(profile.includes("<title>Fact sheet | Nathan No-ot - Solar Power Systems</title>"), "profile must be titled Fact sheet");
check(!profile.includes("Recruiter &amp; AI Brief"), "profile must not retain the Recruiter & AI Brief title");
check(!resume.includes("Download resume"), "resume page must use the accented résumé spelling on its download button");
check(!profile.includes("Download resume"), "profile page must use the accented résumé spelling on its download button");
check(resume.includes("Plain-text résumé"), "resume page must use the accented résumé spelling on the plain-text link");

// C1: the plain-text résumé must match the site's positioning (decision
// 2026-09-02; summary sentence approved 2026-09-03).
const resumeText = readExport("/nathan-noot-resume.txt");
for (const role of ["Electrical engineering student placement", "Power systems internship", "Solar and grid-integration internship", "Electrical engineering student opportunity"]) {
  check(resumeText.includes(`- ${role}`), `plain-text résumé must list target role: ${role}`);
}
for (const stale of ["Graduate electrical engineer", "Defence engineering graduate", "Power engineering graduate"]) {
  check(!resumeText.includes(stale), `plain-text résumé must not retain the graduate-role positioning: ${stale}`);
}
check(!resumeText.includes("building toward graduate electrical engineering work"), "plain-text résumé summary must not retain the graduate positioning");
// Site screening audit 2026-09-13, finding 1 (Nathan's call, 2026-09-16).
check(resumeText.includes("- South Australian internships from 2027"), "plain-text résumé must carry the dated availability window");
// Settled 2026-09-03 against the coursework title page, which reads
// "THREE-TENANCY COMPLEX (SUPERMARKET, HAIRDRESSER, BUTCHER) WITH COMMUNAL
// SERVICES". Communal is shared services at the MSB, not a fourth tenancy.
check(!resumeText.includes("four-tenancy"), "plain-text résumé must not call the LV complex four-tenancy");
// B1 resolved 2026-09-03 in the case study's favour. The project brief
// specifies the mains as "single core cables buried in separate conduits, laid
// in trefoil", so the separately-enclosed column applies. The coursework sized
// them on the single-conduit column instead and reached 35 mm2 / 9.2 kA; the
// résumé inherited those figures. It must now match what the site publishes.
for (const stale of ["35 mm2 consumer mains", "9.2 kA", "<=3.4%"]) {
  check(!resumeText.includes(stale), `plain-text résumé LV figures must match the published case study: ${stale}`);
}
for (const current of ["25 mm2 consumer mains", "8.0 kA", "123.6 A"]) {
  check(resumeText.includes(current), `plain-text résumé must carry the published LV figure: ${current}`);
}
// Deliberate deviation from C2's accent rule: this file is machine-read by ATS
// parsers and terminals, and shipped 5515 bytes with zero non-ASCII. C2 governs
// visible site copy; here ASCII safety wins. Pinned so it is not "fixed" later.
check(!/[^\x00-\x7F]/.test(resumeText), "the plain-text résumé must stay pure ASCII for machine parsers");
check(homeDoc.includes('id="primary-navigation"'), "primary navigation must expose id for mobile aria-controls");
check(homeDoc.includes('aria-controls="primary-navigation"'), "menu button must control primary navigation");

const navMatch = homeDoc.match(/<nav[^>]*id="primary-navigation"[\s\S]*?<\/nav>/);
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

// The F1 fix (site screening audit 2026-09-16) moves header/footer OUT of the
// <main> landmark: main-landmark text comes from renderedMain, while chrome
// (nav, skip link) and narrative ORDER come from the full document.
check(!/<header\b/.test(home) && !/<footer\b/.test(home), "header/footer must sit outside the main landmark");
check(!/<header\b/.test(about) && !/<footer\b/.test(about), "header/footer must sit outside the main landmark on /about");
check((homeDoc.match(/<main id="main-content"/g) ?? []).length === 1, "exactly one main landmark per document");
check(homeDoc.includes('class="skip-link" href="#main-content"'), "skip link must target #main-content");
const heroIndex = homeDoc.indexOf('class="hero"');
const ledgerIndex = homeDoc.indexOf("data-evidence-ledger");
const epilogueIndex = homeDoc.indexOf("data-homepage-epilogue");
const footerIndex = homeDoc.indexOf("<footer");
check(heroIndex >= 0 && heroIndex < ledgerIndex && ledgerIndex < epilogueIndex && epilogueIndex < footerIndex, "home narrative must be hero, power work, epilogue, footer");
check(/data-homepage-epilogue[\s\S]*?<\/section>\s*<\/main>\s*<footer\b/.test(homeDoc), "footer must immediately follow homepage main");
check(!navMatch || !navMatch[0].includes('href="/workbench"'), "Workbench must not enter primary navigation");
const footer = homeDoc.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
check(footer.includes("Ask me about my work."), "footer must use approved ask-about-my-work lead");
check(footer.includes("Available for South Australian internships."), "footer must use approved internship availability support");
for (const destination of ["/contact", "/projects", "/workbench", "/profile"]) {
  check(footer.includes(`href="${destination}"`), `footer must link ${destination}`);
}
check(/href="\/nathan-noot-resume\.pdf"[^>]*target="_blank"/.test(footer), "footer must offer the resume in a new tab");
check(footer.includes("linkedin.com"), "footer must provide LinkedIn action");
check(footer.includes("github.com/Nnoot02") && footer.includes("GitHub"), "footer must render the configured GitHub action");
// Site screening audit 2026-09-13, finding 7 (dispositioned 2026-09-16): the
// plain-text résumé is reachable by clicking from the footer and the fact
// sheet, not only from /resume.
check(footer.includes('href="/nathan-noot-resume.txt"'), "footer must offer the plain-text résumé");
// Scoped to the facts list: the footer chip also renders on /profile, so a
// page-wide check could never go red from the row alone.
const profileFacts = profile.match(/<dl[^>]*class="profile-facts"[^>]*>[\s\S]*?<\/dl>/)?.[0] ?? "";
check(profileFacts.includes('href="/nathan-noot-resume.txt"'), "fact sheet must link the plain-text résumé from its facts list");
const footerAnchors = [...footer.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
const footerUtilityLinkIndex = footerAnchors.findIndex((anchor) => anchor.includes("data-footer-utility"));
check(footerUtilityLinkIndex === footerAnchors.length - 1, "footer recruiter utility must remain the final and quiet action");

const aboutStory = about.match(/<section[^>]*class="about-story"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
const aboutTools = about.match(/<section[^>]*id="tools-and-standards"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
const aboutIntroduction = "I became a chef to help people, then chose engineering to pursue net zero and Australia's energy dominance through solar.";
const previousAboutIntroduction = "I am an electrical engineering student in Adelaide focused on solar power systems and grid integration. My work is grounded in standards-based design and Australian solar manufacturing experience.";
const manufacturingEvidence = "At Tindo Solar I moved from the production line into an electrical engineering internship. The floor work gave me direct exposure to solar-panel manufacturing, 5S, Kaizen, quality checks, and fault-finding culture, and shadowing the engineers showed me how RCA and 8D problem-solving connect engineering decisions with process reliability and operator reality. As an intern I assist with BOM documentation, component selection, and circuit design under engineering direction, and I write the standard operating procedures, work instructions, and quality records that keep production consistent.";
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
]) {
  check(aboutTools.includes(`/projects/${projectSlug}`), `about Tools and standards must link to ${projectSlug}`);
}
// Site screening audit 2026-09-13, finding 3 (Nathan's call, 2026-09-16): the
// pending DFMA study is unlinked from About until its copy clears employer
// review. The node keeps its evidence state; it loses its case-study link.
check(!aboutTools.includes("/projects/solar-manufacturing-dfma"), "about must not link the pending DFMA study while its copy is under review");
// The desktop rail link is computed on selection, so it never appears in the
// static HTML: pin the source too, or re-adding the slug would stay green.
const toolsNetworkSource = readFileSync(new URL("../components/ToolsStandardsNetwork.tsx", import.meta.url), "utf8");
check(!toolsNetworkSource.includes('label: "Solar manufacturing", slug:'), "solar network node must not regain its DFMA case-study slug");
check(!toolsNetworkSource.includes('project: "Solar Manufacturing & DFMA"'), "mobile ledger must not regain its DFMA case-study link");
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
// Site screening audit 2026-09-13, finding 6 (dispositioned 2026-09-16): the
// labelled divs are named role=group groups so their aria-label is honoured,
// and the workbench attribution block is not a landmark (an aside inside main
// trips axe's landmark-complementary-is-top-level).
for (const [block, pattern, groupName] of [
  [projectsIndex, /<div[^>]*class="project-journey-guide"[^>]*>/, "project journey guide"],
  [aboutTools, /<div[^>]*class="tools-evidence-legend"[^>]*>/, "tools evidence legend"],
  [aboutTools, /<div[^>]*class="tools-network-map"[^>]*>/, "tools network map"],
]) {
  const tag = block.match(pattern)?.[0] ?? "";
  check(tag !== "" && tag.includes('role="group"'), `${groupName} must carry role=group so its aria-label is honoured`);
}
for (const workbenchSlug of ["tarmo5", "sesame-robot", "servo-mini-arm"]) {
  const detail = renderedMain(readExport(`/workbench/${workbenchSlug}.html`));
  check(detail.includes('<div class="workbench-attribution" data-source-attribution'), `${workbenchSlug}: attribution block must be a div that keeps its data attribute`);
  check(!detail.includes("<aside"), `${workbenchSlug}: adapted-build page must not render an aside landmark`);
}

// 12px label floor (set for buttons in b2670b2, extended to labels 2026-09-02).
// Print styles are excluded: the only remaining .72rem is inside @media print.
const screenCss = globalsCss.replace(/@media print \{[\s\S]*?\n\}/, "");
check(!/font(?:-size)?:[^;]*\s\.7[0-4]?rem/.test(screenCss), "screen labels must not set a font size below .75rem (12px)");
const contactIntro = "Adelaide-based electrical engineering student open to placements, internships, and project conversations, especially around power systems, grid integration, and practical electrical engineering.";
const contactSnapshot = contact.match(/<aside[^>]*data-technical-snapshot[^>]*>[\s\S]*?<\/aside>/)?.[0] ?? "";
const contactFooter = contactDoc.match(/<footer[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? "";
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
  "Electrical Engineering Intern · Tindo Solar",
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
check(projectsIndex.includes("Systems, taken from theory towards proof."), "projects hero must use approved headline");
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

// DFMA is off the projects index until it has evidence (decision 2026-09-02),
// so it must not carry a case-study number that makes it look like a gap.
// React 19 SSR separates a literal from an adjacent interpolation with an empty
// comment ("Case study <!-- -->04"), so strip those before matching or this
// assertion is a false green that can never go red.
const dfmaCaseStudy = renderedMain(readExport("/projects/solar-manufacturing-dfma.html")).replaceAll("<!-- -->", "");
check(!/Case study 0\d/.test(dfmaCaseStudy), "pending DFMA case study must not render a case-study number");
check(dfmaCaseStudy.includes('<p class="eyebrow">Case study</p>'), "pending DFMA case study must keep the plain Case study eyebrow");
for (const [slug, number] of [["lv-cabling-design-commercial-complex", "01"], ["solar-grid-connection-assessment", "02"], ["gps-denied-autonomous-uav", "03"]]) {
  check(renderedMain(readExport(`/projects/${slug}.html`)).includes(`Case study ${number}`), `${slug} must keep case-study number ${number}`);
}
check(!projectsSource.includes('number: "04"'), "project data must not number the pending DFMA entry");

// Internal editorial scaffolding leaked to production on two case-study routes
// (audit 2026-08-07, P1). Case-study evidence state is public copy only.
const caseStudySlugs = [...projectsSource.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]);
check(caseStudySlugs.length > 0, "project data must declare at least one case-study slug");
for (const slug of caseStudySlugs) {
  const caseStudy = renderedMain(readExport(`/projects/${slug}.html`));
  check(!/Evidence interview required|Content gate/i.test(caseStudy), `${slug} must not publish internal content-gate scaffolding`);
  check(!caseStudy.includes("Replace this panel"), `${slug} must not publish internal editorial instructions`);
}

// Row order, 2026-09-17 (Nathan's call, Option B): content-first DOM (copy
// before image, so title then outcome reach readers and screen readers first),
// while CSS keeps the image in the left column on desktop.
const rowOrder = [...home.matchAll(/class="project-(copy|image)"/g)].map((match) => match[1]);
check(rowOrder.length >= 4 && rowOrder.every((value, index) => (index % 2 === 0 ? value === "copy" : value === "image")), "project rows must carry content-first DOM order (copy before image)");
check(readFileSync(new URL("../components/ProjectRow.tsx", import.meta.url), "utf8").includes('className="project-image"'), "ProjectRow must still render the image block");

// Site screening audit 2026-09-16, F3: every case study opens with the
// contributor's role, the outcome so far, and where the evidence stops. The
// strings come from lib/projects.ts -- no new claims, only earlier order.
const caseOpenings = [
  {
    slug: "lv-cabling-design-commercial-complex",
    role: "Sole designer (coursework)",
    outcome: "123.6 A design current met by 25 mm² X-90 copper consumer mains",
    firstWriteUpId: 'id="design-basis"',
  },
  {
    slug: "solar-grid-connection-assessment",
    role: "Sole author (coursework technical assessment)",
    outcome: "can connect at LV under TS132 where feeder hosting capacity allows",
    firstWriteUpId: 'id="three-capacities"',
  },
  {
    slug: "gps-denied-autonomous-uav",
    role: "Systems planning and verification",
    outcome: "roughly 1.9–2.2:1 thrust-to-weight carrying the full autonomy payload",
    firstWriteUpId: null,
  },
  {
    slug: "solar-manufacturing-dfma",
    role: "Production and DFMA observer",
    outcome: "I will publish once the copy passes employer review",
    firstWriteUpId: null,
  },
];
for (const { slug, role, outcome, firstWriteUpId } of caseOpenings) {
  const doc = renderedMain(readExport(`/projects/${slug}.html`));
  const openingIndex = doc.indexOf('class="case-opening"');
  check(openingIndex >= 0, `${slug}: case study must open with the contribution block`);
  const opening = openingIndex >= 0 ? doc.slice(openingIndex, doc.indexOf("</section>", openingIndex)) : "";
  check(opening.includes(role), `${slug}: opening block must state the role`);
  check(opening.includes(outcome), `${slug}: opening block must state the outcome`);
  if (firstWriteUpId) {
    check(doc.indexOf(firstWriteUpId) > openingIndex, `${slug}: opening block must precede the write-up sections`);
  }
}

// Site screening audit 2026-09-16, F6 (Nathan's call 2026-09-17): plain
// completion language. The old "Verified / sanitised write-up" vocabulary and
// the "What still needs proof" heading must not return.
for (const [slug, expectedStatus] of [
  ["lv-cabling-design-commercial-complex", "Coursework design - every AS/NZS 3000 and 3008.1.1 check shown"],
  ["solar-grid-connection-assessment", "Coursework assessment - every TS132/TS133 and AS/NZS 4777.2 check shown"],
]) {
  const doc = renderedMain(readExport(`/projects/${slug}.html`));
  check(doc.includes(expectedStatus), `${slug}: status must name the verification basis plainly`);
  check(doc.includes("Complete."), `${slug}: evidence status must open plainly with "Complete."`);
  check(doc.includes("Limits and open items"), `${slug}: the plain limits heading must render`);
  check(!doc.includes("Evidence verified"), `${slug}: the old "Evidence verified" status must not return`);
  check(!doc.includes("Sanitised public write-up complete"), `${slug}: the old publication-workflow sentence must not return`);
  check(!doc.includes("What still needs proof"), `${slug}: the old proof heading must not return`);
}

// Site screening audit 2026-09-16, F8 (Nathan's go 2026-09-18): each completed
// study names its next evidence beside the contact line, reusing the relation
// label. Pin both directions and the position after the write-up.
for (const [slug, nextSlug, nextTitle] of [
  ["lv-cabling-design-commercial-complex", "solar-grid-connection-assessment", "1 MW Solar Grid-Connection Assessment"],
  ["solar-grid-connection-assessment", "lv-cabling-design-commercial-complex", "Commercial LV Cabling Design"],
]) {
  const doc = renderedMain(readExport(`/projects/${slug}.html`));
  const nextIndex = doc.indexOf('class="case-next"');
  check(nextIndex >= 0, `${slug}: the closing block must name the next study`);
  const next = nextIndex >= 0 ? doc.slice(nextIndex, doc.indexOf("</p>", nextIndex)) : "";
  check(next.includes(`/projects/${nextSlug}`), `${slug}: next-evidence link must target ${nextSlug}`);
  check(next.includes(nextTitle), `${slug}: next-evidence link must name ${nextTitle}`);
  check(next.includes("standards + verification"), `${slug}: next-evidence link must carry the relation label`);
  check(doc.indexOf('class="case-contact"') > nextIndex, `${slug}: next-evidence line must precede the contact line`);
  check(doc.indexOf('class="case-next"') > doc.indexOf('class="writeup"'), `${slug}: next-evidence line must follow the write-up`);
}

// The one-line diagram is unreadable at mobile widths without the full-size file.
const lvCaseStudy = renderedMain(readExport("/projects/lv-cabling-design-commercial-complex.html"));
const fullSizeDiagramLink = lvCaseStudy.match(/<a\b[^>]*href="\/images\/lv-cabling-sld\.svg"[^>]*>/)?.[0] ?? "";
check(fullSizeDiagramLink.length > 0, "LV case study must link the full-size one-line diagram");
check(fullSizeDiagramLink.includes('target="_blank"') && fullSizeDiagramLink.includes("noopener"), "full-size diagram link must open in a new tab with noopener");

// Scrollable <pre> and table wrappers are keyboard stops in Chrome. Each must
// be a named region so the stop announces what it is (WCAG 4.1.2).
for (const slug of ["lv-cabling-design-commercial-complex", "solar-grid-connection-assessment"]) {
  const writeUp = renderedMain(readExport(`/projects/${slug}.html`));
  for (const block of [...(writeUp.match(/<pre\b[^>]*>/g) ?? []), ...(writeUp.match(/<div[^>]*class="table-scroll"[^>]*>/g) ?? [])]) {
    check(block.includes('role="region"') && /aria-label="[^"]+"/.test(block) && block.includes('tabindex="0"'), `${slug}: scrollable block must be a named focusable region: ${block.slice(0, 60)}`);
  }
}

// PLAN v6 V4. The worked chains are the site's primary evidence and sit directly
// under prose that writes √, Ω, Δ, mm² and ≥. They use the same notation.
// Every substitution the item makes is asserted: the draft pinned five of eight
// and the other three would have regressed silently.
// React escapes < and > in text, so the export carries &lt;=, &gt;= and -&gt;.
for (const slug of ["lv-cabling-design-commercial-complex", "solar-grid-connection-assessment"]) {
  const writeUp = renderedMain(readExport(`/projects/${slug}.html`));
  for (const block of writeUp.match(/<pre\b[^>]*>[\s\S]*?<\/pre>/g) ?? []) {
    for (const ascii of ["sqrt3", "ohm", "mm2", "dV", "&lt;=", "&gt;=", "-&gt;", " x "]) {
      check(!block.includes(ascii), `${slug}: worked chain must use engineering notation, found "${ascii}"`);
    }
  }
}

// PLAN v6 V1. The long write-ups are indexed at the head and every section is
// addressable, so a reviewer can be sent straight to one calculation. These ids
// are public URL fragments: pinned here so they are not renamed silently.
const writeUpIndexes = {
  "lv-cabling-design-commercial-complex": ["design-basis", "maximum-demand", "consumer-mains", "submains", "final-subcircuits", "earthing-and-protection", "fault-level", "assumptions-and-limits"],
  "solar-grid-connection-assessment": ["three-capacities", "connection-voltage", "power-quality", "hosting-capacity", "south-australia", "storage", "standards-basis", "assumptions-and-limits"],
};
for (const [slug, ids] of Object.entries(writeUpIndexes)) {
  const writeUp = renderedMain(readExport(`/projects/${slug}.html`));
  const index = writeUp.match(/<nav[^>]*class="writeup-index"[\s\S]*?<\/nav>/)?.[0] ?? "";
  check(index !== "", `${slug}: write-up must carry a section index`);
  check(/aria-label="[^"]+"/.test(index), `${slug}: write-up index must be a named landmark`);
  for (const id of ids) {
    check(index.includes(`href="#${id}"`), `${slug}: index must link section #${id}`);
    check(new RegExp(`<h3[^>]*id="${id}"`).test(writeUp), `${slug}: section #${id} must exist as an h3 target`);
  }
  check((writeUp.match(/<h3\b/g) ?? []).length === ids.length, `${slug}: index must cover every section`);
}
// The three-section UAV write-up is deliberately unindexed: an index of three
// items directly above those three items is noise.
check(!renderedMain(readExport("/projects/gps-denied-autonomous-uav.html")).includes("writeup-index"), "the three-section UAV write-up must stay unindexed");
// Site screening audit 2026-09-13, findings 4 and 5 (dispositioned 2026-09-16):
// the grid summary argues each conclusion against the standards rather than
// deciding against them, and the two published case-study pages carry no
// U+2014 character (the house register is " - ").
for (const slug of ["lv-cabling-design-commercial-complex", "solar-grid-connection-assessment"]) {
  check(!readExport(`/projects/${slug}.html`).includes("\u2014"), `${slug}: published case-study page must contain no U+2014 character`);
}
check(renderedMain(readExport("/projects/solar-grid-connection-assessment.html")).includes("with each conclusion argued against AS/NZS inverter standards and SAPN TS132/TS133"), "grid summary must argue each conclusion against the standards");
check(globalsCss.includes("scroll-margin-top"), "indexed sections must clear the sticky header on a fragment jump");

// PLAN v6 V2. A reviewer gets one direct contact vector from wherever they are
// reading, without a page load. The address is already visible on /contact,
// /profile and /resume and is already in the Person JSON-LD on every page, so
// this adds reach, not exposure. The literal is spelled out because `profile`
// in this script is the exported /profile.html, not the site config object.
check(footer.includes('href="mailto:nathannoott@gmail.com"'), "footer must offer a direct mailto action");
// The compact footer deliberately gets none: forbiddenContactText forbids the
// address inside it, and a mailto href contains the address. Pinned so the
// omission reads as a decision rather than an oversight.
check(!contactFooter.includes('href="mailto:'), "compact contact footer must not repeat the address as a mailto");
for (const slug of caseStudySlugs) {
  const caseStudy = renderedMain(readExport(`/projects/${slug}.html`));
  check(/class="case-contact"/.test(caseStudy), `${slug}: case study must close with a contact line`);
  check(caseStudy.includes('href="mailto:nathannoott@gmail.com"'), `${slug}: case-study contact line must be a mailto`);
}

// PLAN v7 S1. The spec sheet replaces the evidence-chip row on the three
// published case studies, carrying the numbers a reviewer scans for in a
// pinned order. Row strings are pinned against lib/projects.ts; the block
// extraction keeps a prose match elsewhere on the page from passing. DFMA
// carries no spec data and keeps the chips (fallback, pinned below).
const caseSpecs = {
  "lv-cabling-design-commercial-complex": [
    ["Voltage system", "400 V 3-phase", "230 V line-to-neutral"],
    ["Design current", "123.6 A", "on the heaviest phase (A)"],
    ["Voltage drop", "0.74 %", "consumer mains, against the 1 % limit"],
    ["Standards", "AS/NZS 3000:2018 · AS/NZS 3008.1.1:2025", null],
  ],
  "solar-grid-connection-assessment": [
    ["Inverter AC nameplate", "1.0 MW", "the rated AC output assumed for the assessment"],
    ["PV array DC capacity", "≈1.2 MWp", "installed module capacity; exceeds the inverter rating at a ~1.2 inverter loading ratio"],
    ["Approved export limit", "≤1.0 MW", "possibly below the inverter rating; set by SA Power Networks after the connection study"],
    ["Connection voltage", "LV (TS132) or HV (TS133)", "decided by a site-specific network study, not by capacity"],
    ["Standards", "SAPN TS132/TS133 · AS/NZS 4777.2", null],
  ],
  "gps-denied-autonomous-uav": [
    ["Motors", "2212-class, ~920 KV", "as-shipped; a 2216 upgrade is budgeted"],
    ["Thrust-to-weight", "1.9–2.2:1", "full autonomy payload, ~1.27 kg all-up"],
    ["Flight gate", "≥ 2.3:1", "this project's full-payload gate for integrated flight"],
    ["Hover throttle", "~55 %", "as-shipped propulsion, full payload"],
  ],
};
for (const [slug, rows] of Object.entries(caseSpecs)) {
  const caseStudy = renderedMain(readExport(`/projects/${slug}.html`));
  // React escapes ' as &#x27; in text; normalise before comparing row strings.
  const block = normalizeTextEntities(caseStudy.match(/<table[^>]*class="case-spec__table"[\s\S]*?<\/table>/)?.[0] ?? "");
  check(block !== "", `${slug}: case study must carry the spec sheet`);
  check(/aria-label="[^"]+"/.test(block), `${slug}: spec sheet must be a named table`);
  check(!block.includes("\u2014"), `${slug}: spec sheet must contain no U+2014 character`);
  check(!caseStudy.includes("case-tags"), `${slug}: spec sheet must replace the evidence chips`);
  let lastAt = -1;
  for (const [label, value, note] of rows) {
    const at = block.indexOf(`>${label}</th>`);
    check(at !== -1, `${slug}: spec sheet must include the "${label}" row`);
    check(block.includes(`>${value}</td>`), `${slug}: spec sheet must include the "${label}" value`);
    if (note) check(block.includes(`>${note}</td>`), `${slug}: spec sheet must include the "${label}" note`);
    check(at > lastAt, `${slug}: spec rows must appear in listed order`);
    lastAt = at;
  }
}
const dfmaPage = renderedMain(readExport("/projects/solar-manufacturing-dfma.html"));
check(dfmaPage.includes("tag-list"), "DFMA must keep the evidence chips (no spec data)");
check(!dfmaPage.includes("case-spec"), "DFMA must not render the spec sheet");

// PLAN v7 S2. The pinned strip: a duplicate, non-interactive readout pinned
// under the header at >=1100px only. Markup is pinned so it cannot silently
// gain focusables or lose its aria-hidden; the print block must hide it (a
// fixed element would otherwise stamp every printed page); the offset scheme
// variables must exist; and the strip must exclude Standards rows (reference
// material stays in the table) and the notes.
const printBlock = globalsCss.match(/@media print \{[\s\S]*?\n\}/)?.[0] ?? "";
check(printBlock.includes(".case-spec__strip"), "print styles must hide the spec strip");
// PLAN v7 Rev 3 (audit C1/C4), corrected by Rev 4 (audit D1/D2): the chrome
// geometry is rem-aware; floor and measurement are separate values so
// min-height can never read what the observer writes (a measurement written
// into min-height ratchets), and the strip observer's root is extended so a
// below-fold arrival still crosses.
check(globalsCss.includes("--header-floor: max(76px, calc(4.25rem + 8px))"), "header floor must carry the rem-aware expression");
check(globalsCss.includes("--header-floor: max(68px, 2.05rem)"), "mobile header floor must carry the rem-aware expression");
check(globalsCss.includes("--header-h: var(--header-measured, var(--header-floor))"), "the header variable must prefer the measurement and fall back to the floor");
check(globalsCss.includes("min-height: var(--header-floor)"), "min-height must read the floor, never the measured value (ratchet guard)");
check(globalsCss.includes(".site-nav { display: none; position: absolute; top: var(--header-h);"), "mobile nav offset must follow the header variable");
check(globalsCss.includes(".case-study { --strip-h: 44px; }"), "strip reservation must be scoped to case studies");
check(!/:root\s*\{\s*--strip-h/.test(globalsCss), "strip reservation must not sit on :root");
const siteHeaderSource = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
check(siteHeaderSource.includes("ResizeObserver") && siteHeaderSource.includes('setProperty("--header-measured"'), "the header must be measured onto --header-measured");
const caseSpecSource = readFileSync(new URL("../components/CaseSpec.tsx", import.meta.url), "utf8");
check(caseSpecSource.includes("rootMargin"), "the strip observer must extend its root so a below-fold arrival crosses");
check(["--header-h", "--clear-gap", "--strip-h"].every((name) => globalsCss.includes(name)), "offset-scheme variables must exist in globals.css");
check(/\.writeup-block h3 \{[^}]*scroll-margin-top: calc\(var\(--header-h\) \+ var\(--strip-h/.test(globalsCss), "scroll-margin-top must reserve header + strip + gap");
for (const [slug, rows] of Object.entries(caseSpecs)) {
  const caseStudy = normalizeTextEntities(renderedMain(readExport(`/projects/${slug}.html`)));
  const strip = caseStudy.match(/<div[^>]*class="case-spec__strip"[\s\S]*?<\/div>/)?.[0] ?? "";
  check(strip !== "", `${slug}: spec strip markup missing`);
  check(strip.includes('aria-hidden="true"'), `${slug}: spec strip must be aria-hidden`);
  check(!strip.includes("<a ") && !strip.includes("<button"), `${slug}: spec strip must stay non-interactive`);
  for (const [label, value, note] of rows) {
    if (label === "Standards") check(!strip.includes(value), `${slug}: Standards rows must stay out of the strip`);
    else check(strip.includes(`${value}</b>`), `${slug}: strip must carry the "${label}" value`);
    if (note) check(!strip.includes(note), `${slug}: strip must omit notes`);
  }
}

// Site screening audit 2026-09-16, F5 (Nathan's call 2026-09-17): the index
// thumbnails are REAL artifacts -- the LV one-line diagram, the solar
// single-line concept, the UAV prototype photo -- not illustrative triptychs.
const projectIndexAssets = [
  "/images/project-index/lv-cabling-artifact.webp",
  "/images/project-index/solar-grid-connection-artifact.webp",
  "/images/project-index/gps-denied-uav-artifact.webp",
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
  // Workbench evidence photos are the only images with no full-size route: the
  // LV diagram has its own link. Each figure opens a native <dialog>, which
  // brings focus trapping, Escape and background inertness from the platform
  // rather than from hand-written focus code (decision B4, 2026-09-03).
  const gallery = detail.match(/<section[^>]*class="workbench-evidence"[\s\S]*?<\/section>/)?.[0] ?? "";
  if (gallery.includes("workbench-evidence-grid")) {
    const triggers = gallery.match(/<button[^>]*class="[^"]*evidence-trigger[^"]*"[^>]*>/g) ?? [];
    const figures = gallery.match(/<figure\b/g) ?? [];
    check(triggers.length === figures.length, `${slug}: every evidence figure must open a full-size view (${triggers.length} triggers for ${figures.length} figures)`);
    check((gallery.match(/<dialog\b/g) ?? []).length === 1, `${slug}: the evidence gallery must share exactly one dialog`);
    check(/<dialog[^>]*aria-label="[^"]+"/.test(gallery), `${slug}: the evidence dialog must be named`);
  }
}

check(sitemap.includes("/workbench"), "sitemap must include the Workbench collection");

// public/_headers is read by Cloudflare Workers static assets from out/. It
// is the only place HSTS, nosniff and the immutable cache rule for hashed
// _next/static assets are set. Prove it ships and prove it still says so.
const exportedHeaders = readExport("/_headers");
const publicHeaders = readBytes("public", "/_headers");
check(publicHeaders !== null && exportedHeaders === publicHeaders.toString("utf8"), "public/_headers must ship unchanged in the static export");
check(/^\/_next\/static\/\*\r?\n  Cache-Control: public, max-age=31536000, immutable/m.test(exportedHeaders), "_headers must mark hashed _next/static assets immutable");
check(/^\/\*\r?\n(?:  [^\n]*\n)*?  Strict-Transport-Security: max-age=31536000/m.test(exportedHeaders), "_headers must set HSTS on every path");
check(exportedHeaders.includes("  X-Content-Type-Options: nosniff"), "_headers must set nosniff");
check(!workbench.includes("ESP32 Drone Reproduction"), "Workbench must not publish ESP32 before owned evidence exists");
check(!sitemap.includes("/projects/esp32-drone"), "sitemap must not include the retired ESP32 project route");
check(!sitemap.includes("/workbench/esp32-drone-reproduction"), "sitemap must not publish the gated ESP32 Workbench route");
for (const slug of detailSlugs) {
  check(sitemap.includes(`/workbench/${slug}`), `sitemap must include ${slug}`);
}

// og:type is inherited from the root layout by every route that does not declare
// its own openGraph. Next replaces that object wholesale rather than merging it,
// so a route that overrides even one key silently drops site_name, locale and the
// image dimensions. Check every route, not a sample: drift is per route.
// NB: `home` above is renderedMain(), i.e. <main> only. OG tags live in <head>,
// so these read the whole document.
function ogTag(document, property) {
  return document.match(new RegExp(`property="og:${property}" content="([^"]*)"`))?.[1] ?? "";
}

const homeDocument = readExport("/index.html");
check(ogTag(homeDocument, "type") === "profile", "home must declare og:type profile");
for (const property of ["site_name", "locale", "image:width", "image:height", "image:alt"]) {
  check(ogTag(homeDocument, property) !== "", `home must keep og:${property}; overriding openGraph drops inherited keys`);
}
for (const route of ["about", "contact", "projects", "resume", "profile", "workbench"]) {
  check(ogTag(readExport(`/${route}.html`), "type") === "website", `/${route} must declare og:type website, not profile`);
}
for (const slug of caseStudySlugs) {
  check(ogTag(readExport(`/projects/${slug}.html`), "type") === "article", `/projects/${slug} must declare og:type article`);
}
for (const slug of detailSlugs) {
  check(ogTag(readExport(`/workbench/${slug}.html`), "type") === "article", `/workbench/${slug} must declare og:type article`);
}

// Favicons come from Next's file convention: app/icon1.png, app/icon2.svg,
// app/apple-icon.png. Numbered names sort lexically so the PNG is listed first
// for browsers without SVG favicon support. Prove the links exist and prove the
// files they point at ship.
const iconLinks = homeDocument.match(/<link[^>]*rel="icon"[^>]*>/g) ?? [];
check(iconLinks.some((link) => link.includes('type="image/png"')), "home must link a PNG favicon");
check(iconLinks.some((link) => link.includes('type="image/svg+xml"')), "home must link the SVG favicon");
check(/<link[^>]*rel="apple-touch-icon"/.test(homeDocument), "home must link an apple touch icon");
for (const link of [...iconLinks, ...(homeDocument.match(/<link[^>]*rel="apple-touch-icon"[^>]*>/g) ?? [])]) {
  const href = link.match(/href="([^"?]+)/)?.[1] ?? "";
  check(href.length > 0 && existsSync(new URL(`../out${href}`, import.meta.url)), `icon ${href || link} must ship in the static export`);
}

// Every link that opens a new tab says so to assistive tech (WCAG G201). The
// LV diagram link set the pattern; this pins it across every exported page.
const exportedPages = [
  "/index.html", "/about.html", "/contact.html", "/projects.html", "/resume.html", "/profile.html", "/workbench.html",
  ...caseStudySlugs.map((slug) => `/projects/${slug}.html`),
  ...detailSlugs.map((slug) => `/workbench/${slug}.html`),
];
for (const path of exportedPages) {
  const newTabAnchors = readExport(path).match(/<a\b[^>]*target="_blank"[^>]*>[\s\S]*?<\/a>/g) ?? [];
  for (const anchor of newTabAnchors) {
    check(anchor.includes("opens in a new tab"), `${path}: new-tab link must announce it: ${anchor.replace(/<[^>]+>/g, "").trim().slice(0, 40)}`);
    check(/href="[^"]*\.pdf"/.test(anchor) ? anchor.includes("(PDF, opens in a new tab)") : true, `${path}: PDF link must say PDF: ${anchor.replace(/<[^>]+>/g, "").trim().slice(0, 40)}`);
  }
}

// Case-study and workbench cards must be complete (site_name, locale) and
// must not advertise the site title on Twitter/X when the page has its own.
const siteDefaultTitle = "Nathan No-ot | Solar Power Systems Portfolio";
function twitterTag(document, name) {
  return document.match(new RegExp(`name="twitter:${name}" content="([^"]*)"`))?.[1] ?? "";
}
for (const path of [...caseStudySlugs.map((slug) => `/projects/${slug}.html`), ...detailSlugs.map((slug) => `/workbench/${slug}.html`)]) {
  const document = readExport(path);
  for (const property of ["site_name", "locale"]) {
    check(ogTag(document, property) !== "", `${path} must carry og:${property}; spread sharedOpenGraph`);
  }
  check(twitterTag(document, "card") === "summary_large_image", `${path} must keep the large summary card`);
  check(twitterTag(document, "title") !== siteDefaultTitle, `${path} must not pin the site default as twitter:title`);
}
check(/<meta name="theme-color" content="#f3f0e9"/.test(homeDocument), "home must declare theme-color as --paper");
check(/<meta name="color-scheme" content="light"/.test(homeDocument), "home must declare a light colour scheme");

if (failures.length) {
  console.error("Portfolio contract failures:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Portfolio contract checks passed.");
