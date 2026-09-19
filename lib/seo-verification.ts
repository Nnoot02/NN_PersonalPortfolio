// Search-engine verification codes and the Cloudflare Web Analytics token.
//
// Every value here ships verbatim in the page's HTML, so none of them is a
// secret: paste the code the dashboard gives you, commit it, and the artefact
// stays put through every later deploy. An empty string renders nothing.
//
// Google Search Console: add a URL-prefix property for https://nnoott.com,
// choose "HTML tag", and paste the value of the tag's content attribute (or
// verify by DNS TXT on the apex instead -- see the runbook in InternalOS,
// learning/seo-aeo-deep-dive/nnoott-manual-steps.md).
// Bing Webmaster Tools: add the site and choose "HTML meta tag", or import
// the property from Search Console.
// Cloudflare Web Analytics: Web Analytics -> add nnoott.com -> Manage site ->
// "Enable with JS Snippet installation", then copy the token.

export const googleSiteVerification = "";

export const bingSiteVerification = "";

export const cloudflareBeaconToken = "";
