# Personal Portfolio

Recruiter-first engineering portfolio built with Next.js and shipped as a static
site on Cloudflare Pages.

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

## Deploy (Cloudflare Pages)

Connected via Git integration:

- Build command: `pnpm build`
- Output directory: `out`
- Environment variable: `NEXT_PUBLIC_SITE_URL` set to the deployed site URL

`NEXT_PUBLIC_SITE_URL` is inlined at build time and drives canonical URLs, the
sitemap, and structured data, so it must be set wherever the build runs.
