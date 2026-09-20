// Search-engine verification codes and the Cloudflare Web Analytics token.
//
// Every value here ships verbatim in the page's HTML, so none of them is a
// secret: paste the code the dashboard gives you, commit it, and the artefact
// stays put through every later deploy. An empty string renders nothing.
//
// Paste only the value: the content attribute of the meta tag, or the token
// from the snippet -- not the surrounding tag or script element.
//
// Google Search Console: add a URL-prefix property for https://nnoott.com,
// choose "HTML tag", and paste the value of the tag's content attribute. A
// Domain property works too, verified by a DNS TXT record on the apex with
// content google-site-verification=<code> instead of this tag.
// Bing Webmaster Tools: add the site and choose "HTML meta tag", or import
// the property from Search Console.
// Cloudflare Web Analytics: Web Analytics -> add nnoott.com -> Manage site ->
// "Enable with JS Snippet installation", then copy the token.

export const googleSiteVerification = "mKmhSVVPJKdwygRGAfdzSJCv4oC6wp7OraGwmVzVyzI";

export const bingSiteVerification = "58C24E2AA51BF9FE993B902304B3759C";

export const cloudflareBeaconToken = "db35db87d442467594a4d701a3602aaa";
