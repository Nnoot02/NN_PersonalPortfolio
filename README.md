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

Build and deploy intentionally from a clean `main` checkout:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://nnoott.com"
pnpm build
npx wrangler deploy
```

`NEXT_PUBLIC_SITE_URL` is inlined at build time and drives canonical URLs, the
sitemap, and structured data. Keep it set to the production custom domain for
production builds.
