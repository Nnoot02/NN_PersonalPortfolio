// Canonical entry-point redirects for nnoott.com.
//
// The site is a static export deployed as a Worker with static assets
// (wrangler.jsonc: assets.run_worker_first). Three non-canonical entry points
// -- http://nnoott.com, https://www.nnoott.com and http://www.nnoott.com --
// served 200 with byte-identical HTML before this script existed. A
// `_redirects` file cannot fix them: Cloudflare matches paths only in it, and
// "Domain-level redirects" are explicitly unsupported for Workers static
// assets.
//
// Only hosts this site owns are redirected; anything else (localhost, a
// workers.dev hostname, any future host) passes through untouched.

const CANONICAL_ORIGIN = "https://nnoott.com";
const CANONICAL_HOST = "nnoott.com";
const OWNED_HOSTS = new Set([CANONICAL_HOST, "www.nnoott.com"]);

// The first deploy after this ships must not be cached hard by browsers: a
// wrong permanent redirect is the one failure a redeploy cannot undo. Raise
// this once scripts/canonical-host-probe.mjs has passed against production.
const REDIRECT_CACHE_CONTROL = "max-age=600";

/**
 * The canonical Location for a request URL on one of the site's own hosts, or
 * null when the request is already canonical or is not a host we own.
 *
 * @param {string} requestUrl
 * @returns {string | null}
 */
export function canonicalRedirectLocation(requestUrl) {
  const url = new URL(requestUrl);
  if (!OWNED_HOSTS.has(url.hostname)) return null;
  if (url.hostname === CANONICAL_HOST && url.protocol === "https:") return null;

  // The platform's own trailing-slash handling sends /projects/ to /projects;
  // collapsing it here keeps a redirect of a redirect to a single hop.
  const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return `${CANONICAL_ORIGIN}${path}${url.search}`;
}

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch(request: Request): Promise<Response> } }} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const location = canonicalRedirectLocation(request.url);
    if (location) {
      // Hand-built rather than Response.redirect(): that constructor returns
      // headers with an immutable guard, so the Cache-Control below could not
      // be attached.
      return new Response(null, {
        status: 308,
        headers: { Location: location, "Cache-Control": REDIRECT_CACHE_CONTROL },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
