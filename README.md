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
- `S3_BUCKET` — S3-compatible bucket name for production media
- `S3_REGION` — storage region (`auto` for some providers like Cloudflare R2)
- `S3_ENDPOINT` — bucket API endpoint origin without a trailing slash
- `S3_PUBLIC_BASE_URL` — optional public/CDN base URL for serving files (recommended for Cloudflare R2/custom domains)
- `S3_ACCESS_KEY_ID` — storage access key
- `S3_SECRET_ACCESS_KEY` — storage secret key
- `S3_CLIENT_UPLOADS` — set to `true` on Vercel to bypass server upload size limits
- `S3_FORCE_PATH_STYLE` — optional path-style mode for providers like MinIO/LocalStack

## Revalidation Flow

Content hooks trigger server revalidation by posting to `/api/revalidate` with `x-revalidate-secret`. This keeps cached server-rendered pages fresh after content changes.

## Deployment Notes (Vercel)

- Deploy as a Node runtime Next.js app
- Use managed Postgres in production
- Configure S3-compatible object storage for the `media` collection in production
- `S3_*` env vars are optional locally; when all required values are present, Payload automatically switches `media` uploads away from local disk storage
- Set `S3_PUBLIC_BASE_URL` when files should be served from a public bucket domain or CDN instead of the raw S3 API endpoint
- For Cloudflare R2, use `S3_REGION=auto`, `S3_FORCE_PATH_STYLE=true`, and set `S3_PUBLIC_BASE_URL` to your `r2.dev` or custom domain
- For Vercel, keep `S3_CLIENT_UPLOADS=true` and allow `PUT` CORS requests from your site origin on the bucket
- Do **not** rely on local disk uploads in production

See `docs/vercel-deployment-checklist.md` for the production env checklist and smoke-test runbook.
