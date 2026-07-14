import { readFileSync } from "node:fs";

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function readExport(path) {
  return readFileSync(new URL(`../out${path}`, import.meta.url), "utf8");
}

const home = readExport("/index.html");
const resume = readExport("/resume.html");
const profile = readExport("/profile.html");

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
const heroMedia = home.match(/<a[^>]*class="hero-image"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
check(heroMedia.length > 0, "home must expose hero media link");
check(heroMedia.includes("/images/solar-grid-connection.webp"), "home hero must use solar grid-connection artifact");
check(!heroMedia.includes("data-miniature-evidence-window") && !heroMedia.includes("/images/solar-grid-miniature.png"), "home hero must defer miniature content");
check((heroMedia.match(/<a\b/g) ?? []).length === 1, "home hero media must retain one destination link");
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

if (failures.length) {
  console.error("Portfolio contract failures:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Portfolio contract checks passed.");
