# Agent Handoff: Blog Build Plan + Current Progress

Last updated: 2026-05-01
Project: `my-blog`

## 1) Goal (locked)

Build a fast, clean, mostly server-rendered personal blog on Payload + Next.js with:

- Single-author workflow
- Manually curated homepage + automatic recent work section
- Dark mode in v1 (system preference)
- SEO-ready architecture
- Vercel as deployment target
- Newsletter/comments deferred

## 2) Completed Phases

### ✅ Phase 1 — CMS Foundation

Implemented:

- Access helpers:
  - `src/access/adminOnly.ts`
  - `src/access/publishedOrAdmin.ts`
  - `src/access/firstUserOrAdmin.ts`
- Reusable fields:
  - `src/fields/slug.ts`
  - `src/fields/seo.ts`
- Hooks/revalidation scaffolding:
  - `src/hooks/populatePublishedAt.ts`
  - `src/hooks/revalidateContent.ts`
  - `src/lib/revalidate.ts`
- Collections/globals:
  - `users`, `media`, `categories`, `posts`, `pages`
  - `site-settings`, `homepage`
- Payload config wired for new schema
- Types regenerated and TypeScript passed

### ✅ Phase 2 — Frontend Routes + UI

Implemented server-rendered public routes:

- `/`
- `/blog`
- `/blog/page/[pageNumber]`
- `/blog/[slug]`
- `/category/[slug]`
- `/<slug>`
- custom `not-found`

Implemented:

- Query layer (`src/lib/queries/*`)
- Shared UI components (`src/components/*`)
- Rich text rendering component
- Site layout/header/footer
- Light/dark theme styling via CSS variables
- Homepage featured + recent work behavior
- Removed starter sample route `src/app/my-route/route.ts`

### ✅ Phase 3 — SEO + Revalidation Endpoint + Indexing

Implemented:

- Metadata utilities:
  - `src/lib/metadata.ts`
  - `src/lib/routes.ts`
- `generateMetadata` across public routes
- Indexing/feed routes:
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`
  - `src/app/rss.xml/route.ts`
- Revalidation API endpoint:
  - `src/app/api/revalidate/route.ts`
- Env and README updates:
  - `.env.example`
  - `README.md`

## 3) Current Repo State

Recent commits:

- `cb937a7` — phases 1-2 CMS + frontend
- `d651e3b` — metadata/sitemap/robots/rss/revalidate endpoint

Design/planning docs:

- `docs/personal-blog-design.md`
- `docs/personal-blog-implementation-plan.md`

## 4) Outstanding / Next Work (Phase 4+)

### High-priority production tasks

1. Add production media storage plugin (S3-compatible)
   - local disk uploads are not suitable for Vercel production
2. Verify env vars in Vercel:
   - `DATABASE_URL`
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `REVALIDATION_SECRET`
3. End-to-end smoke test in deployed environment:
   - publish/update/delete post
   - verify page revalidation + sitemap/rss updates

### Recommended polish

- Optional manual theme toggle (currently system-preference dark mode)
- JSON-LD enhancement for posts
- Related posts/search/newsletter (deferred items)

## 5) Known Issues / Notes

- `pnpm exec tsc --noEmit` passes.
- `pnpm lint` currently fails due missing package in project lint config:
  - `@eslint/eslintrc` not found.
- `docker-compose.yml` still reflects old template and may need cleanup if Docker workflow is required.

## 6) Security/Access Notes (important)

- Public Local API reads use `overrideAccess: false`.
- Published-only access is enforced by `publishedOrAdmin` for posts/pages.
- Revalidation endpoint is secret-protected via `x-revalidate-secret`.

## 7) Quick runbook

Local dev:

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Validation:

```bash
pnpm generate:types
pnpm exec tsc --noEmit
```

## 8) Suggested immediate next step

Implement production storage (S3-compatible) and do a first Vercel deploy validation pass.
