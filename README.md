# Personal Portfolio

Recruiter-first engineering portfolio built with Next.js and shipped as static
assets on Cloudflare Workers.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Static export (`output: "export"`) — no server runtime required
- Self-hosted fonts (Barlow Condensed, Inter) via Fontsource; Phosphor icons

## Develop

```powershell
pnpm install
pnpm dev
```

## Build

```powershell
pnpm build   # static site written to ./out
```

## Deploy (Cloudflare Workers)

Production target:

- Source branch: `main`
- Worker: `noot-portfolio`
- Custom domain: `https://nnoott.com`
- Assets directory: `out`, configured in `wrangler.jsonc`
- Worker script: `worker/index.mjs`, configured with `main` and
  `assets.run_worker_first` (see "Canonical entry points" below)

Build and deploy intentionally from a clean `main` checkout:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://nnoott.com"
pnpm build
pnpm exec wrangler deploy
```

`NEXT_PUBLIC_SITE_URL` is inlined at build time and drives canonical URLs, the
sitemap, and structured data. Keep it set to the production custom domain for
production builds.

`wrangler` is pinned in `devDependencies` (`pnpm exec`, not `npx`): the config
keys this deployment depends on (`assets.binding`, `assets.run_worker_first`)
are version-sensitive, and everything else in this repo is pinned exactly.

## Canonical entry points

`http://nnoott.com`, `https://www.nnoott.com` and `http://www.nnoott.com` used
to serve the same bytes as `https://nnoott.com`. A `_redirects` file cannot fix
that -- Cloudflare matches paths only in it, so domain-level redirects are
unsupported -- and the redirect therefore lives in `worker/index.mjs`, which
runs ahead of the static assets and answers 308 to the canonical origin (path
and query preserved). Only the site's own hostnames are redirected; every other
host passes through. `workers_dev` and `preview_urls` are off so the platform
hostnames cannot serve a second copy.

After any deploy, prove it:

```powershell
pnpm probe:redirects
```

The probe checks the four entry points, one subpath, the HSTS/nosniff headers
`public/_headers` declares, and one hashed asset (which catches a stale local
`out/`).

## Search verification and analytics

`lib/seo-verification.ts` is the single place for the three public values that
make search presence measurable: the Google Search Console tag, the Bing
`msvalidate.01` tag and the Cloudflare Web Analytics token. Each is empty until
a code is pasted in, and empty means nothing renders -- no blank meta tag and no
analytics script. Committed rather than environment-supplied, so a later deploy
cannot silently drop the tag that keeps the property verified.

`pnpm verify` fails if a configured code does not ship, and also if an
unconfigured one ships an empty tag.

## Sitemap dates

`app/sitemap.ts` stamps each URL with the newest commit over the content files
that page renders, listed in `lib/sitemap-route-sources.json`. A new page, or a
new content component under an existing page, must be added to that manifest:
`pnpm test:repo` checks it against the disk and the published route set, and the
contract recomputes every date, so a stale entry fails a gate instead of
freezing a date silently.
