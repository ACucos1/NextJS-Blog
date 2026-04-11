# My Blog (Payload + Next.js)

Personal blog built with Payload CMS 3 + Next.js App Router.

## Stack

- Payload CMS (embedded in Next.js)
- Next.js 16
- PostgreSQL (`@payloadcms/db-postgres`)
- Lexical rich text editor

## Current Features

- Admin-authenticated CMS
- Collections: `users`, `media`, `categories`, `posts`, `pages`
- Globals: `site-settings`, `homepage`
- Server-rendered public routes:
  - `/`
  - `/blog`
  - `/blog/page/[pageNumber]`
  - `/blog/[slug]`
  - `/category/[slug]`
  - `/<slug>` (CMS pages)
- SEO/feed routes:
  - `/sitemap.xml`
  - `/robots.txt`
  - `/rss.xml`
- Revalidation endpoint: `POST /api/revalidate`
- Light + dark theme (system preference)

## Local Setup

1. Copy env file

```bash
cp .env.example .env
```

2. Ensure PostgreSQL is running and `DATABASE_URL` is valid.

3. Install and run

```bash
pnpm install
pnpm dev
```

4. Open

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Useful Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm generate:types
pnpm generate:importmap
pnpm lint
```

## Environment Variables

- `DATABASE_URL` — Postgres connection string
- `PAYLOAD_SECRET` — Payload secret
- `NEXT_PUBLIC_SITE_URL` — canonical site URL used in metadata/sitemap/rss
- `REVALIDATION_SECRET` — shared secret for `/api/revalidate`

## Revalidation Flow

Content hooks trigger server revalidation by posting to `/api/revalidate` with `x-revalidate-secret`. This keeps cached server-rendered pages fresh after content changes.

## Deployment Notes (Vercel)

- Deploy as a Node runtime Next.js app
- Use managed Postgres in production
- Do **not** rely on local disk uploads in production (use S3-compatible object storage)
