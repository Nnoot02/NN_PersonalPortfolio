import { readFileSync } from "node:fs";

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
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
const workbench = renderedMain(readExport("/workbench.html"));
const sitemap = readExport("/sitemap.xml");

check(home.includes("Electrical engineering student · Adelaide"), "home hero eyebrow must state electrical-engineering student and Adelaide");
check(home.includes("Solar power systems &amp; grid integration"), "home hero must state solar power systems and grid integration");
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
check(heroMedia.includes("/images/solar-grid-connection.webp"), "home hero must use solar grid-connection artifact");
check(!heroMedia.includes("data-miniature-evidence-window") && !heroMedia.includes("/images/solar-grid-miniature.png"), "home hero must defer miniature content");
check((heroMedia.match(/<a\b/g) ?? []).length === 0, "home hero media must not contain a destination link");
check(home.includes("Tindo Solar") && home.includes("Production Worker") && home.includes("Nov 2025–present"), "home must contain public-safe Tindo experience strip");
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
for (const slug of ["solar-grid-connection-assessment", "lv-cabling-design-commercial-complex"]) {
  const row = ledger.match(new RegExp(`<li[^>]*data-project-slug="${slug}"[\\s\\S]*?<\\/li>`))?.[0] ?? "";
  check(row.length > 0, `ledger must include ${slug}`);
  check((row.match(new RegExp(`/projects/${slug}`, "g")) ?? []).length === 1, `${slug} ledger row must have one destination link`);
}

check(home.includes("Power Systems Work"), "home must replace Evidence ledger with Power Systems Work");
check(!home.includes("Evidence ledger"), "home must not retain the clinical Evidence ledger title");
check(home.includes("View selected work"), "home jump action must read View selected work");
check(!home.includes("View verified work"), "home must not retain View verified work");
check(home.includes("data-workbench-home"), "home must expose the Workbench preview region");
check(home.includes("data-workbench-home") && (home.match(/data-workbench-entry/g) ?? []).length === 2, "home Workbench preview must expose exactly two entries");
check(home.includes("data-workbench-home") && (home.match(/href=\"\/workbench\//g) ?? []).length === 2, "home Workbench previews must have one detail destination each");
check(home.includes("data-workbench-home") && home.includes('href="/workbench"'), "home Workbench preview must link to the collection");
const tindoIndex = home.indexOf("tindo-strip");
const workbenchIndex = home.indexOf("data-workbench-home");
const broaderWorkIndex = home.indexOf("broader-work");
const ledgerIndex = home.indexOf("data-evidence-ledger");
check(ledgerIndex < broaderWorkIndex && broaderWorkIndex < workbenchIndex && workbenchIndex < tindoIndex, "home must place verified work before current work, Workbench, and Tindo context");
check(!navMatch || !navMatch[0].includes('href="/workbench"'), "Workbench must not enter primary navigation");
const footer = home.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
const footerAnchors = [...footer.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
const footerWorkbenchLinkIndex = footerAnchors.findIndex((anchor) => anchor.includes('href="/workbench"'));
const footerUtilityLinkIndex = footerAnchors.findIndex((anchor) => anchor.includes("data-footer-utility"));
check(footerWorkbenchLinkIndex >= 0 && footerUtilityLinkIndex === footerAnchors.length - 1 && footerWorkbenchLinkIndex < footerUtilityLinkIndex, "footer must place Workbench before recruiter utility, which must be last");

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
for (const slug of detailSlugs) {
  check(sitemap.includes(`/workbench/${slug}`), `sitemap must include ${slug}`);
}

if (failures.length) {
  console.error("Portfolio contract failures:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Portfolio contract checks passed.");
