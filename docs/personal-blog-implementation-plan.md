# Personal Blog Implementation Plan

Status: Approved planning draft
Date: 2026-03-20
Project: `my-blog`
Related: `docs/personal-blog-design.md`

## 1. Approved Product Decisions

These decisions are now locked in for MVP:

- **Deployment target:** Vercel
- **Author model:** single author
- **Homepage:** manually curated hero / featured section + automatic recent work section
- **Theme support:** light + dark mode in v1
- **Newsletter/comments:** deferred until later
- **Rendering model:** server-rendered public pages with aggressive caching and on-demand revalidation
- **Editor model:** Payload admin + Lexical rich text
- **Public URL structure:**
  - posts at `/blog/[slug]`
  - category archives at `/category/[slug]`
  - static pages at `/<slug>`

### Working assumption for dark mode

For MVP, dark mode will be implemented with **CSS variables + system preference**.

That gives us real dark mode in v1 without introducing extra client-side complexity.
If you want a manual theme toggle afterward, we can add it as a very small isolated client component.

---

## 2. Delivery Strategy

We should implement this in a way that keeps the public site:

- mostly server-rendered
- minimal in browser JavaScript
- cache-friendly
- secure against accidental draft leakage
- easy to deploy to Vercel with Postgres + object storage

### Key technical rules

1. **Use server components by default** for the public site.
2. **Do not fetch Payload content client-side** for public pages.
3. **Use the Payload Local API on the server only.**
4. **Always set `overrideAccess: false`** for public Local API reads so collection access rules are enforced.
5. **Keep query depth shallow** and use `select` for list views.
6. **Use tag/path revalidation** after content changes.
7. **Do not rely on local filesystem uploads in production.**

---

## 3. Proposed Project Structure

Recommended additions to the current project:

```text
src/
  access/
    adminOnly.ts
    publishedOrAdmin.ts
  app/
    (frontend)/
      [slug]/page.tsx
      blog/
        page.tsx
        page/
          [pageNumber]/page.tsx
        [slug]/page.tsx
      category/
        [slug]/page.tsx
      layout.tsx
      not-found.tsx
      page.tsx
      styles.css
    api/
      revalidate/route.ts
    robots.ts
    rss.xml/route.ts
    sitemap.ts
  collections/
    Categories.ts
    Media.ts
    Pages.ts
    Posts.ts
    Users.ts
  components/
    posts/
      PostCard.tsx
      PostHero.tsx
      PostList.tsx
      PostMeta.tsx
    rich-text/
      RichText.tsx
    site/
      SiteFooter.tsx
      SiteHeader.tsx
    ui/
      Container.tsx
      Prose.tsx
      SectionHeading.tsx
  fields/
    seo.ts
    slug.ts
  globals/
    Homepage.ts
    SiteSettings.ts
  hooks/
    populatePublishedAt.ts
    revalidateContent.ts
  lib/
    metadata.ts
    payload.ts
    readingTime.ts
    revalidate.ts
    routes.ts
    queries/
      categories.ts
      pages.ts
      posts.ts
      site.ts
  payload.config.ts
```

### Existing files to replace or clean up

- Replace the blank frontend in `src/app/(frontend)/page.tsx`
- Replace the blank global styles in `src/app/(frontend)/styles.css`
- Update `src/app/(frontend)/layout.tsx`
- Remove the example route at `src/app/my-route/route.ts`
- Update `.env.example` to match Postgres + Vercel-oriented env vars
- Update `README.md` and optionally `docker-compose.yml` because they still reflect the blank Mongo template

---

## 4. CMS Schema Plan

## 4.1 Collections

### `users`

Purpose:

- Payload admin authentication
- internal only
- not used as the public author model

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `text` | required |
| `roles` | `select` (`hasMany`) | start with `admin` role; save to JWT |
| `avatar` | `relationship` -> `media` | optional |

Notes:

- Keep `auth: true`
- Use `email` as admin title
- The public site should source author info from `site-settings`, not from `users`
- Operationally, v1 assumes a single admin account

Access approach:

- `read/update/delete`: admin only
- `create`: allow Payload first-user bootstrap, then admin only

Implementation note:

- We may need a small bootstrap-aware access helper for first user creation so we do not break initial setup.

---

### `media`

Purpose:

- featured images
- inline content images
- social/OG images
- author portrait

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `alt` | `text` | required |
| `caption` | `textarea` | optional |
| `credit` | `text` | optional |

Upload notes:

- Keep uploads enabled locally
- Add image sizes for at least:
  - `thumbnail`
  - `card`
  - `hero`
  - `og`
- Continue using local storage in development
- Switch to S3-compatible storage before production deployment

Access:

- `read`: public
- `create/update/delete`: admin only

---

### `categories`

Purpose:

- light taxonomy for posts

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | `text` | required |
| `slug` | `text` | required, unique, indexed |
| `description` | `textarea` | optional but recommended |

Access:

- `read`: public
- `create/update/delete`: admin only

Hooks / behavior:

- auto-generate `slug` from `title` when missing
- revalidate category archives and post lists when categories change

---

### `posts`

Purpose:

- primary blog content

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | `text` | required |
| `slug` | `text` | required, unique, indexed |
| `excerpt` | `textarea` | required, used for cards + metadata |
| `featuredImage` | `relationship` -> `media` | optional but strongly recommended |
| `content` | `richText` | required |
| `categories` | `relationship` -> `categories` (`hasMany`) | optional |
| `publishedAt` | `date` | indexed, auto-set on first publish |
| `seo.title` | `text` | optional override |
| `seo.description` | `textarea` | optional override |
| `seo.image` | `relationship` -> `media` | optional override |
| `seo.canonicalURL` | `text` | optional override |

Collection config notes:

- `admin.useAsTitle = 'title'`
- drafts enabled via `versions.drafts`
- default columns should include `title`, `slug`, `_status`, `publishedAt`, `updatedAt`

Access:

- `read`: published for anonymous users, full access for admin
- `create/update/delete`: admin only

Hooks / behavior:

- beforeValidate: generate slug from title when empty
- beforeChange: set `publishedAt` when moving into published state and no value exists yet
- afterChange / afterDelete: trigger revalidation

Explicitly not included in MVP:

- tags collection
- related posts engine
- view counts
- custom block-based page builder

---

### `pages`

Purpose:

- static CMS pages like `/about`, `/uses`, `/now`

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | `text` | required |
| `slug` | `text` | required, unique, indexed |
| `description` | `textarea` | recommended |
| `heroImage` | `relationship` -> `media` | optional |
| `content` | `richText` | required |
| `showInNavigation` | `checkbox` | optional |
| `navigationLabel` | `text` | shown only when `showInNavigation` is true |
| `navigationOrder` | `number` | for menu ordering |
| `seo.title` | `text` | optional override |
| `seo.description` | `textarea` | optional override |
| `seo.image` | `relationship` -> `media` | optional override |
| `seo.canonicalURL` | `text` | optional override |

Collection config notes:

- `admin.useAsTitle = 'title'`
- drafts enabled via `versions.drafts`
- validate page slugs against reserved routes

Reserved slugs to block:

- `blog`
- `category`
- `admin`
- `api`
- `rss.xml`
- `sitemap.xml`
- `robots.txt`

Access:

- `read`: published for anonymous users, full access for admin
- `create/update/delete`: admin only

Hooks / behavior:

- beforeValidate: generate slug from title when empty
- afterChange / afterDelete: revalidate page route + navigation + sitemap

---

## 4.2 Globals

### `site-settings`

Purpose:

- reusable site-wide metadata and single-author information

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `siteName` | `text` | required |
| `siteTagline` | `text` | optional |
| `defaultMetaTitle` | `text` | optional |
| `defaultMetaDescription` | `textarea` | required |
| `defaultOGImage` | `relationship` -> `media` | optional |
| `authorName` | `text` | required |
| `authorBio` | `textarea` or small `richText` | recommended |
| `authorImage` | `relationship` -> `media` | optional |
| `socialLinks` | `array` | label/platform + URL |
| `footerText` | `text` or `textarea` | optional |

Important implementation choice:

- The canonical base URL should come from an environment variable like `NEXT_PUBLIC_SITE_URL`
- We should **not** duplicate deployment URLs in CMS content unless we truly need to
- This avoids configuration drift between environments

Access:

- `read`: public
- `update`: admin only

Hooks / behavior:

- afterChange: revalidate shared layout data, metadata, sitemap, RSS if needed

---

### `homepage`

Purpose:

- manual homepage curation

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `headline` | `text` | required |
| `intro` | `richText` or `textarea` | short intro copy |
| `portrait` | `relationship` -> `media` | optional |
| `featuredSectionHeading` | `text` | default `Featured` |
| `featuredPosts` | `relationship` -> `posts` (`hasMany`) | ordered, validate max 3 |
| `recentWorkHeading` | `text` | default `Recent work` |
| `recentWorkLimit` | `number` | default 5, min 1, max 10 |

Homepage behavior:

- top section is manually curated
- `featuredPosts` preserves manual editorial order
- `recent work` automatically shows newest published posts
- latest posts should exclude any post already shown in the featured section to avoid duplication

Access:

- `read`: public
- `update`: admin only

Hooks / behavior:

- afterChange: revalidate homepage

---

## 4.3 Shared Field Factories

To keep schema code clean, we should extract reusable field helpers.

### `src/fields/slug.ts`

Responsibilities:

- shared slug field definition
- uniqueness + index settings
- optional reserved slug validation hook/helper
- consistent admin UI placement

### `src/fields/seo.ts`

Responsibilities:

- reusable SEO group for posts and pages
- `title`
- `description`
- `image`
- `canonicalURL`

This avoids duplicating the same field group in multiple collections.

---

## 4.4 Shared Access Helpers

Recommended access helper modules:

### `src/access/adminOnly.ts`

Returns `true` only when the user has the `admin` role.

### `src/access/publishedOrAdmin.ts`

For `posts` and `pages`:

- if admin user exists on the request: return `true`
- otherwise: return `{ _status: { equals: 'published' } }`

Important note:

- This is only effective if public Local API reads use `overrideAccess: false`

---

## 4.5 Shared Hooks

### `src/hooks/populatePublishedAt.ts`

Responsibilities:

- set `publishedAt` automatically when a post is first published
- do not overwrite a manually chosen date on later updates

### `src/hooks/revalidateContent.ts`

Responsibilities:

- call an internal revalidation endpoint after post/page/category/global changes
- send content-type-aware paths and tags
- keep all public pages fresh without full rebuilds

---

## 5. Frontend Route Plan

## 5.1 Public Routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | homepage | manual featured content + recent work |
| `/blog` | first page of blog index | newest published posts |
| `/blog/page/[pageNumber]` | paginated archive pages | page 2+ |
| `/blog/[slug]` | post detail page | server-rendered article page |
| `/category/[slug]` | category archive page | list all published posts in category |
| `/<slug>` | static CMS page | `about`, `uses`, `now`, etc. |
| `/rss.xml` | RSS feed | route handler |
| `/sitemap.xml` | sitemap | Next sitemap export |
| `/robots.txt` | robots | Next robots export |

### Notes on route precedence

- Explicit routes like `/blog/*` and `/category/*` will take precedence over `/<slug>`
- We still need reserved slug validation in `pages` so editors cannot accidentally create conflicting routes

---

## 5.2 Public Page Behavior

### Homepage: `src/app/(frontend)/page.tsx`

Data needed:

- `homepage` global
- `site-settings` global
- featured posts by relationship
- latest published posts for recent work

Sections:

1. intro / hero
2. curated featured posts
3. recent work

Rendering:

- server component
- cached
- revalidated on homepage or post changes

---

### Blog index: `src/app/(frontend)/blog/page.tsx`

Data needed:

- paginated published post list

Behavior:

- show newest first via `publishedAt` desc
- use compact post cards
- canonical page for page 1

### Blog pagination: `src/app/(frontend)/blog/page/[pageNumber]/page.tsx`

Behavior:

- same list template as `/blog`
- canonical metadata per page number
- page 1 should redirect or canonicalize to `/blog`

---

### Post page: `src/app/(frontend)/blog/[slug]/page.tsx`

Data needed:

- post by slug
- site settings for metadata fallback

Sections:

- title
- date + reading time + categories
- featured image
- prose content
- optional author note / footer later

Rendering:

- server component
- cached per slug
- revalidated when post changes

---

### Category page: `src/app/(frontend)/category/[slug]/page.tsx`

Data needed:

- category by slug
- published posts in that category

Behavior:

- render category title + description
- render list of matching posts
- order by newest first
- pagination can be deferred unless content volume grows

---

### Static page route: `src/app/(frontend)/[slug]/page.tsx`

Data needed:

- page by slug

Behavior:

- render hero title/description/image if present
- render prose body
- used for `/about`, `/uses`, `/now`

---

### Layout: `src/app/(frontend)/layout.tsx`

Responsibilities:

- load site-wide layout data
- apply typography + theme variables
- render header / footer
- include skip link if nav grows beyond minimal size

Data needed:

- `site-settings`
- pages where `showInNavigation = true`

Header default links:

- `Home`
- `Blog`
- any published pages flagged for navigation

---

## 5.3 Special Routes

### `src/app/rss.xml/route.ts`

Include:

- latest published posts
- title, link, description, pub date
- canonical URLs using `NEXT_PUBLIC_SITE_URL`

### `src/app/sitemap.ts`

Include:

- homepage
- blog index
- published posts
- published pages
- category pages

### `src/app/robots.ts`

Include:

- allow public routes
- sitemap location
- optionally disallow admin routes if desired

### `src/app/api/revalidate/route.ts`

Purpose:

- secret-protected internal endpoint used by Payload hooks
- accepts tags and/or paths
- calls Next revalidation utilities

This is the safest way to connect Payload content changes to cached public pages.

---

## 6. Data Access Layer Plan

We should centralize frontend reads in small server-only query modules.

## 6.1 Shared Payload Instance

### `src/lib/payload.ts`

Responsibilities:

- return the Payload instance for server-side use
- avoid duplicating setup logic across pages and route handlers

---

## 6.2 Query Modules

### `src/lib/queries/site.ts`

Functions:

- `getSiteSettings()`
- `getHomepage()`
- `getNavigationPages()`

### `src/lib/queries/posts.ts`

Functions:

- `getRecentPosts(limit)`
- `getPaginatedPosts(pageNumber, pageSize)`
- `getPostBySlug(slug)`
- `getPostsByCategorySlug(slug)`
- `getFeaturedPosts(ids)`

### `src/lib/queries/pages.ts`

Functions:

- `getPageBySlug(slug)`
- `getPublishedPagesForNavigation()`

### `src/lib/queries/categories.ts`

Functions:

- `getCategoryBySlug(slug)`
- `getAllCategories()`

### Query rules

All public query functions should:

- run on the server only
- use `overrideAccess: false`
- use low `depth`
- use `select` to keep payloads small
- return already-shaped frontend data where helpful

### Example selection strategy

For post lists, fetch only:

- `title`
- `slug`
- `excerpt`
- `publishedAt`
- `featuredImage`
- `categories`

For post detail, include:

- `content`
- full SEO group
- featured image
- categories

This prevents over-fetching and keeps server responses fast.

---

## 6.3 Metadata Utilities

### `src/lib/metadata.ts`

Responsibilities:

- merge page/post-specific SEO with site defaults
- build canonical URLs from `NEXT_PUBLIC_SITE_URL`
- provide shared helpers for `generateMetadata`

### `src/lib/routes.ts`

Responsibilities:

- generate canonical route strings for posts, pages, categories
- keep URL generation consistent across metadata, sitemap, RSS, and UI links

### `src/lib/readingTime.ts`

Responsibilities:

- derive reading time from rendered content text
- computed at render time, not stored in CMS

---

## 7. Revalidation Strategy

## 7.1 Why this matters

The public site should feel static and extremely fast, but content changes in Payload must appear quickly.

So the implementation should use:

- cacheable server-rendered pages
- content-tag or path-based invalidation
- no full rebuild required for each publish

## 7.2 Primary approach

Use a **secret-protected Next revalidation route**.

Flow:

1. content changes in Payload
2. Payload hook determines affected paths/tags
3. hook calls `/api/revalidate`
4. Next invalidates cached data/routes
5. next request regenerates fresh HTML

## 7.3 Suggested revalidation tags

| Tag | Used for |
| --- | --- |
| `site-settings` | layout + global metadata |
| `homepage` | homepage global data |
| `posts` | blog index + homepage recent work |
| `post:{slug}` | single post page |
| `pages` | page queries / navigation |
| `page:{slug}` | single page route |
| `categories` | category indexes and labels |
| `category:{slug}` | single category archive |
| `navigation` | header/footer nav derived from pages |
| `rss` | RSS feed |
| `sitemap` | sitemap output |

## 7.4 Revalidation map by content type

### Post change

Invalidate:

- tags: `posts`, `post:{slug}`, `rss`, `sitemap`, `categories`
- paths: `/`, `/blog`, `/blog/${slug}`, and any affected `/category/${slug}` archive paths

### Page change

Invalidate:

- tags: `pages`, `page:{slug}`, `navigation`, `sitemap`
- paths: `/${slug}`

### Category change

Invalidate:

- tags: `categories`, `category:{slug}`, `sitemap`
- paths: `/category/${slug}`, `/blog`

### Homepage global change

Invalidate:

- tags: `homepage`
- paths: `/`

### Site settings change

Invalidate:

- tags: `site-settings`, `navigation`, `sitemap`, `rss`
- paths: none required if all dependent queries are tag-cached, but homepage and blog can also be revalidated for certainty

## 7.5 Implementation note

We should **not** depend on `generateStaticParams` for the blog as the primary freshness mechanism.

For this project, runtime server rendering + caching + revalidation is the better fit because:

- content changes after deployment are expected
- the site is small enough that runtime cache regeneration is fine
- it avoids build-time coupling to all current slugs

---

## 8. Public UI / Component Plan

## 8.1 Design system direction

Use a small custom design system built from:

- CSS variables for tokens
- a single variable sans font via `next/font`
- lightweight, reusable server components

### Token categories

At minimum:

- `--color-bg`
- `--color-surface`
- `--color-text`
- `--color-text-muted`
- `--color-border`
- `--color-accent`
- `--space-*`
- `--radius-*`
- `--container-*`

### Theme strategy

- define light theme tokens on `:root`
- override dark theme tokens with `@media (prefers-color-scheme: dark)`
- keep the markup the same across themes

---

## 8.2 Component Inventory

### Site shell

| Component | Type | Purpose |
| --- | --- | --- |
| `SiteHeader` | server | site navigation |
| `SiteFooter` | server | footer/social links |
| `Container` | server | width wrapper |
| `SectionHeading` | server | section titles |
| `Prose` | server | article/page typography wrapper |

### Post components

| Component | Type | Purpose |
| --- | --- | --- |
| `PostCard` | server | index/archive card |
| `PostList` | server | reusable list wrapper |
| `PostHero` | server | title/meta/hero image area |
| `PostMeta` | server | date, categories, reading time |

### Rich text

| Component | Type | Purpose |
| --- | --- | --- |
| `RichText` | server | render Lexical content to frontend markup |

### Optional later

| Component | Type | Purpose |
| --- | --- | --- |
| `ThemeToggle` | client | manual theme override |
| `CopyLinkButton` | client | copy URL interaction |
| `MobileNavToggle` | client | if nav complexity grows |

## 8.3 Admin UI customization

For MVP, keep the Payload admin mostly stock.

We do **not** need custom admin components unless a specific editing pain point appears.
That keeps complexity low and avoids unnecessary import-map work early.

---

## 9. Content Rendering Plan

## 9.1 Rich text rendering

Use Payload's Lexical frontend renderer for:

- headings
- paragraphs
- lists
- links
- quotes
- code blocks if needed
- uploaded images if included in content

The frontend renderer should live in `src/components/rich-text/RichText.tsx` and be used by both posts and pages.

## 9.2 Derived content data

Compute these at render time:

- reading time
- word count if needed
- table of contents later if needed

Do not store these in the database for MVP.

---

## 10. SEO / Discoverability Plan

## 10.1 Metadata

Every public route should implement `generateMetadata` using shared helpers.

### Fallback order

#### Posts

1. `seo.title`
2. `title`
3. site default title pattern

1. `seo.description`
2. `excerpt`
3. site default description

1. `seo.image`
2. `featuredImage`
3. `site-settings.defaultOGImage`

#### Pages

1. `seo.title`
2. `title`
3. site default title pattern

1. `seo.description`
2. `description`
3. site default description

## 10.2 Structured data

Add JSON-LD for post pages in MVP if straightforward.

Minimum target:

- `BlogPosting`

If it adds too much friction during core build, it can be added at the end of Phase 3.

## 10.3 Feeds / indexing

Include in MVP:

- `rss.xml`
- `sitemap.xml`
- `robots.txt`

---

## 11. Deployment / Environment Plan

## 11.1 Vercel runtime assumptions

- deploy as a standard Next.js Node app
- do not target Edge runtime for Payload-related routes
- use managed Postgres
- use external object storage for uploads

## 11.2 Environment variables

Recommended MVP env vars:

```env
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATION_SECRET=...

# Production media storage, phase 3
S3_BUCKET=...
S3_REGION=...
S3_ENDPOINT=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

## 11.3 Repo cleanup items

Current template leftovers should be updated:

- `.env.example` still references MongoDB and should be corrected
- `docker-compose.yml` still reflects the Mongo blank template and should be updated or removed
- `README.md` should describe the actual blog setup

## 11.4 Media storage plan

Before production deployment:

- add an S3-compatible Payload storage plugin
- configure media collection uploads to use object storage
- keep local uploads for local development if desired

---

## 12. Phased Build Order

## Phase 1 — Schema + backend foundation

Goal: establish the content model and secure data access.

Tasks:

1. Create shared access helpers
2. Create shared field helpers (`slug`, `seo`)
3. Update `Users`
4. Update `Media`
5. Add `Posts`
6. Add `Categories`
7. Add `Pages`
8. Add `SiteSettings` global
9. Add `Homepage` global
10. Register new collections/globals in `src/payload.config.ts`
11. Add revalidation hooks/utilities
12. Run `pnpm generate:types`
13. Run `pnpm tsc --noEmit`

Definition of done:

- admin can create posts, pages, categories, site settings, homepage content
- public reads are correctly access-controlled
- types regenerate cleanly

---

## Phase 2 — Frontend routes + UI foundation

Goal: replace the blank template with the real public site shell.

Tasks:

1. Build `src/lib/payload.ts`
2. Build query modules
3. Replace frontend layout
4. Replace global styles with token-based light/dark theme
5. Build shared UI components (`Container`, `Prose`, etc.)
6. Build header/footer
7. Build homepage
8. Build blog index + pagination
9. Build post detail route
10. Build category route
11. Build static page route
12. Add `not-found.tsx`
13. Remove `src/app/my-route/route.ts`

Definition of done:

- site looks like a real blog, not the blank Payload starter
- all main public routes render via server components
- no public page depends on client-side data fetching

---

## Phase 3 — SEO + revalidation + deployment readiness

Goal: make the site production-ready.

Tasks:

1. Build metadata utilities
2. Add `generateMetadata` to public routes
3. Add `rss.xml`
4. Add `sitemap.xml`
5. Add `robots.txt`
6. Add `/api/revalidate`
7. Wire content hooks to revalidation endpoint
8. Update `.env.example`
9. Update `README.md`
10. Add S3-compatible media storage configuration
11. Validate Vercel deployment assumptions

Definition of done:

- publish/update/delete flows refresh the right public pages
- metadata is present across all public routes
- feeds and indexing endpoints work
- production env requirements are documented

---

## Phase 4 — polish and optional enhancements

Goal: finish non-essential improvements only after the core is stable.

Potential tasks:

- manual theme toggle
- JSON-LD enhancement
- richer code block styling
- preview mode polish
- related posts
- search
- newsletter
- analytics

---

## 13. Validation Checklist

After schema changes:

- `pnpm generate:types`
- `pnpm tsc --noEmit`

After route/component work:

- `pnpm lint`
- `pnpm build`

Manual checks:

- draft posts do not appear publicly
- draft pages do not appear publicly
- homepage featured posts preserve manual order
- recent work excludes featured posts
- dark mode works via system preference
- navigation only shows published pages marked for navigation
- metadata falls back correctly when SEO fields are empty
- publish/update/delete triggers revalidation
- RSS/sitemap/robots resolve correctly

---

## 14. Recommended Immediate Next Step

Start with **Phase 1** only:

1. model the collections/globals
2. add access control helpers
3. add slug/SEO field factories
4. wire revalidation hooks scaffolding
5. regenerate types

That gives us a stable CMS foundation before we spend time on frontend polish.
