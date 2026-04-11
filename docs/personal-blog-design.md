# Personal Blog Design Doc

Status: Draft v0.1
Date: 2026-03-20
Project: `my-blog`

## 1. Context

This repository currently starts from the Payload blank template:

- Next.js app router frontend
- Payload CMS embedded in the same app
- PostgreSQL already configured locally
- Default collections: `users`, `media`
- Very little frontend or content modeling yet

The goal is to turn this into a fast, clean, personal blog that is easy to write in, easy to maintain, and deployable to Vercel or Netlify.

---

## 2. Product Goals

### Primary goals

1. **Fast public site**
   - Public pages should be mostly server-rendered and heavily cached.
   - Minimal client-side JavaScript.
   - Excellent Core Web Vitals.

2. **Clean editorial design**
   - Typography-first layout.
   - Calm, minimal UI.
   - Great reading experience on desktop and mobile.

3. **Simple author workflow**
   - Write and publish posts from Payload admin.
   - Manage images, metadata, categories, and static pages.
   - Support drafts and scheduled-friendly publishing patterns.

4. **SEO-ready architecture**
   - Per-page metadata.
   - Sitemap, robots, RSS.
   - Canonicals and social sharing data.

5. **Deployment-ready stack**
   - Works well on Vercel.
   - Can remain portable to Netlify where practical.
   - Uses external Postgres and external object storage in production.

### Secondary goals

- Strong accessibility by default.
- Easy extension for search, newsletter, and notes later.
- Maintainable TypeScript-first codebase.

---

## 3. Non-Goals for MVP

These should **not** be in the first build unless priorities change:

- Complex page builder
- Full-text search
- Comments system
- Multi-author public profiles
- Heavy animations or visual effects
- Client-side content fetching for the public site
- Large UI libraries or unnecessary frontend dependencies

---

## 4. Recommended High-Level Direction

### Recommended product shape

A **single-author personal blog** with:

- Home page
- Blog index
- Individual blog posts
- Category pages
- A small number of content-managed static pages (`/about`, `/uses`, `/now`, etc.)
- RSS feed, sitemap, robots.txt

### Recommended technical direction

- Keep **Payload + Next.js in one app**.
- Use **server components by default**.
- Treat the public site as **static-first / cache-first**, while still generated on the server.
- Use **Payload Local API only on the server**.
- Use **Postgres for content** and **S3-compatible storage for media** in production.
- Prefer **Vercel** as the primary deployment target.

### Why Vercel is the preferred target

Both Vercel and Netlify are possible, but Vercel is the smoother default for this stack because:

- Payload is embedded inside a Next.js app
- Next.js app router support is most straightforward on Vercel
- Revalidation and image optimization are simplest there
- Fewer deployment edge cases for modern Next.js features

We can still keep the app portable by:

- Avoiding local filesystem assumptions
- Using external Postgres
- Using external object storage
- Keeping runtime logic Node-compatible instead of edge-only

---

## 5. Proposed Site Architecture

### App shape

One Next.js application containing:

- Public frontend routes
- Payload admin routes
- Payload API
- Shared types and data access

### Runtime model

#### Public frontend

- Rendered with **Next.js server components**
- Cached aggressively
- Minimal or zero client-side data fetching
- Only small interactive islands when truly needed

#### Admin

- Standard Payload admin interface
- Dynamic and authenticated
- Separate from the public rendering strategy

### Rendering strategy

Use a **hybrid static-first server rendering** model:

- Public pages are rendered on the server
- Most public routes are cacheable and can be regenerated when content changes
- Draft preview and admin remain dynamic

This gives the best balance of:

- very fast page loads
- SEO
- simple authoring
- low client-side JS

---

## 6. Information Architecture

### Public routes

Recommended route structure:

- `/` — homepage
- `/blog` — paginated blog index
- `/blog/[slug]` — post detail page
- `/category/[slug]` — category archive page
- `/[slug]` — content-managed static pages like `about`, `uses`, `now`
- `/rss.xml` — RSS feed
- `/sitemap.xml` — sitemap
- `/robots.txt` — robots

### Route design notes

- Keeping posts under `/blog/[slug]` avoids collisions with static pages.
- Content-managed pages can use short clean URLs.
- We should reserve slugs like `blog`, `category`, `admin`, `api`, `rss.xml`, `sitemap.xml`, and `robots.txt`.

---

## 7. Content Model

## 7.1 Collections and Globals

### Collections

| Slug | Purpose | MVP? |
| --- | --- | --- |
| `users` | Admin authentication | Yes |
| `media` | Images and uploaded assets | Yes |
| `posts` | Blog posts | Yes |
| `categories` | Organize posts | Yes |
| `pages` | Static CMS-managed pages like About | Yes |

### Globals

| Slug | Purpose | MVP? |
| --- | --- | --- |
| `site-settings` | Global site metadata and author info | Yes |
| `homepage` | Homepage intro and curation controls | Yes |

### Deferred / later

- `tags` collection
- `authors` public collection
- `projects`
- `notes`
- redirects plugin / redirects collection

---

## 7.2 Users

Purpose:

- Admin login only
- Internal publishing users

Recommended fields:

- `roles` (`admin`, optionally `editor`)
- `name`
- optional `avatar`

Notes:

- Public author data should **not** depend on exposing auth users publicly.
- For MVP, public author identity should come from `site-settings`, not from a public `users` endpoint.
- If we later need guest authors or a team blog, we can add a separate `authors` collection.

---

## 7.3 Media

Purpose:

- Featured images
- Inline post images
- OG/social images
- Author image

Recommended fields:

- `alt` (required)
- `caption` (optional)
- `credit` (optional)

Important deployment note:

- The current local upload setup is fine for development.
- For Vercel/Netlify production we should move media to **S3-compatible object storage**.
- Good candidates: AWS S3, Cloudflare R2, Supabase Storage, or similar.

---

## 7.4 Posts

Purpose:

- Primary blog content

Recommended MVP fields:

- `title` — required
- `slug` — required, unique, indexed
- `excerpt` — required or strongly encouraged
- `featuredImage` — relation to `media`
- `content` — Lexical rich text
- `categories` — relationship to `categories`, hasMany
- `tags` — simple text array for MVP, or omit until phase 2
- `featured` — boolean
- `publishedAt` — explicit publish date
- `seo` group:
  - `title`
  - `description`
  - `image`
  - `canonicalURL`
- drafts enabled via versions

Recommended behavior:

- Auto-generate slug from title when missing
- Set `publishedAt` when first published
- Public reads return **published only**
- Drafts available in admin and preview mode only

Derived or computed at render time:

- reading time
- word count
- table of contents
- estimated time to read

Design choice:

- Use **rich text**, not a full block page builder, for posts in MVP.
- This keeps the editorial experience focused and the frontend simpler.

---

## 7.5 Categories

Purpose:

- Light taxonomy for browsing

Recommended fields:

- `title`
- `slug` — unique, indexed
- `description`
- optional `color` or accent token later

Notes:

- Categories are enough for MVP.
- A separate tags collection can be added later if the content volume grows.

---

## 7.6 Pages

Purpose:

- CMS-managed static pages like About, Uses, Now, Contact

Recommended MVP fields:

- `title`
- `slug` — unique, indexed
- `description`
- `heroImage` — optional
- `content` — Lexical rich text
- `seo` group
- drafts enabled

Design choice:

- Use a constrained page model, not a generic page builder.
- This reduces complexity and keeps the site fast and cohesive.

---

## 7.7 Site Settings Global

Purpose:

- Global site metadata and reusable author/site info

Recommended fields:

- `siteName`
- `siteTagline`
- `siteURL`
- `defaultMetaTitle`
- `defaultMetaDescription`
- `defaultOGImage`
- `authorName`
- `authorBio`
- `authorImage`
- `socialLinks`
- `footerText`
- optional navigation links if needed

Notes:

- This global becomes the source of truth for metadata and author identity.
- It keeps the site single-author and simple.

---

## 7.8 Homepage Global

Purpose:

- Control the homepage intro and curated top sections without hardcoding everything

Recommended fields:

- `headline`
- `intro`
- optional `portrait`
- `featuredPosts` relationship, max 1–3
- `recentWorkHeading` (default something like `Recent work`)
- `recentWorkLimit` (default 5)
- optional `newsletterCTA` later, not in MVP

Recommended behavior:

- The top of the homepage is **manually curated**.
- A separate **Recent work** section should automatically pull the latest published posts.
- If no curated featured posts are selected yet, the homepage can temporarily fall back to latest published posts so the page never feels empty.

---

## 8. Editorial Workflow

### Publishing flow

1. Create draft post
2. Add title, excerpt, content, categories, featured image, SEO fields
3. Review preview or admin draft view
4. Publish
5. Trigger route revalidation for affected pages

### Drafts

Use Payload drafts/versions for:

- posts
- pages

Benefits:

- safer editing
- future preview support
- scheduling-friendly model

### Admin UX principles

- Keep admin schema minimal and predictable
- Prefer a few high-quality fields over many optional knobs
- Avoid complex layout blocks until clearly needed

---

## 9. Frontend Design Direction

### Design goals

- Minimal
- Editorial
- Quiet and readable
- Feels personal, not corporate

### Visual direction

- Strong typography and spacing
- Neutral palette with one accent color
- Generous whitespace
- Clear content hierarchy
- Simple cards, simple borders, subtle hover states

### Layout principles

- Narrow reading width for article bodies
- Slightly wider layout for index pages
- Sticky or always-visible top nav on desktop, simplified on mobile
- Footer with social links and RSS

### Theme recommendation

For MVP:

- Ship **both light and dark mode** in v1
- Prefer a token-based CSS variable system so both themes share the same component styles
- Default to the user's system preference
- If we add a manual theme switch, keep it as a very small isolated client component

This keeps dark mode support first-class without introducing heavy client-side theming logic.

### Typography recommendation

- Use **one self-hosted variable font** via `next/font`
- Pair with system fallbacks
- Keep font loading extremely simple

Recommendation:

- One sans-serif family for UI and body
- Monospace only for code blocks

---

## 10. Component Strategy

### Public component types

- `SiteHeader`
- `SiteFooter`
- `Hero`
- `PostCard`
- `FeaturedPostCard`
- `CategoryBadge`
- `Pagination`
- `RichTextRenderer`
- `Prose`
- `SEOJsonLd`

### Rules

- Default to **server components**
- Introduce client components only for small interactions
- No global client-side state library for MVP

Potential small client components:

- mobile nav toggle
- theme toggle, if we decide to support manual override beyond system preference
- copy-link button

---

## 11. Rendering, Caching, and Revalidation

### Core strategy

Public pages should be:

- server-rendered
- cacheable
- revalidated on content changes

### Route behavior

#### Homepage

- Server-rendered
- Cached
- Revalidated when homepage config, site settings, or featured/latest posts change

#### Blog index

- Server-rendered
- Cached
- Revalidated when posts publish/unpublish/delete

#### Post detail

- Server-rendered
- Cached per slug
- Revalidated when that post changes

#### Category pages

- Server-rendered
- Cached
- Revalidated when related posts or category metadata change

#### Static pages

- Server-rendered
- Cached
- Revalidated when page content changes

### Implementation notes

Use Next.js cache/revalidation primitives to support:

- route-level caching
- on-demand invalidation after content updates
- minimal rework for unchanged pages

### Important Payload security note

When using the Payload Local API for public frontend queries, we must **not bypass access control**.

That means public queries should explicitly enforce access rules, for example by using:

- `overrideAccess: false`

This is critical so drafts or protected fields do not leak to the public site.

---

## 12. Data Access Patterns

### Recommended pattern

- Fetch data only in server components, route handlers, metadata functions, and utility modules on the server.
- Use the Payload Local API directly.
- Keep query depth shallow and use `select` where possible.

### Query guidelines

- Use `overrideAccess: false` for public reads
- Use low `depth` values
- Select only fields needed for each view
- Index `slug`, `publishedAt`, and any frequently filtered fields

### Avoid

- client-side fetching from Payload for the public UI
- over-fetching full documents for list views
- deep relationship population unless necessary

---

## 13. SEO Strategy

### MVP SEO requirements

- `generateMetadata` for all public routes
- Page title and description fallbacks from `site-settings`
- Canonical URL support
- Open Graph + Twitter metadata
- JSON-LD for blog posts
- XML sitemap
- robots.txt
- RSS feed

### Post-specific SEO

Each post should support:

- custom SEO title
- custom SEO description
- social image override
- canonical URL override if needed

Fallbacks:

- SEO title falls back to post title
- SEO description falls back to excerpt
- social image falls back to featured image or site default image

---

## 14. Performance Strategy

### Performance priorities

1. Minimal JavaScript shipped to the browser
2. Cached server-rendered HTML for public pages
3. Optimized images
4. Fast font loading
5. Lean CSS and component model

### Specific decisions

- Use server components by default
- Avoid heavy animation libraries
- Avoid client-side content hydration unless needed
- Use `next/image`
- Use responsive image sizes
- Use self-hosted fonts through `next/font`
- Keep CSS simple with tokens and a small design system

### Styling approach

Recommended:

- CSS Modules or scoped CSS files
- CSS custom properties for design tokens

Rationale:

- no runtime styling cost
- easy to maintain
- fits a clean, minimal blog well

---

## 15. Accessibility Strategy

MVP expectations:

- semantic heading structure
- sufficient color contrast
- keyboard accessible navigation
- visible focus states
- alt text required on media
- sensible link text
- skip link if header/nav becomes more complex

---

## 16. Deployment and Infrastructure

### Production architecture

- App host: **Vercel preferred**, Netlify possible
- Database: managed Postgres
- Media: S3-compatible object storage
- Environment variables managed by host

### Required production environment variables

At minimum:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SITE_URL` or equivalent
- storage credentials for media provider

### Hosting notes

#### Vercel

Recommended default because:

- better alignment with modern Next.js
- smoother ISR/revalidation behavior
- easier image optimization path

#### Netlify

Possible, but may require more attention depending on Next.js runtime behavior and adapter support.

### Critical deployment requirement

Do **not** rely on local filesystem uploads in production.

Because Vercel and Netlify have ephemeral filesystems, uploaded media must be stored externally.

---

## 17. Security and Access Control

### Public access rules

- `posts`: public can read published content only
- `pages`: public can read published content only
- `categories`: public can read
- `media`: public read for referenced assets
- `users`: not publicly exposed as author data source

### Admin access rules

- `users`: admin-only management, optionally editor role later
- publishing restricted to authenticated admin/editor users

### Payload-specific rules

- Always use `overrideAccess: false` when passing a user or when enforcing public access through Local API
- Always pass `req` to nested Local API operations inside hooks
- Prevent hook recursion with context flags if needed

---

## 18. MVP Feature List

### Included in MVP

- Home page with manual curation + automatic recent work section
- Blog index with pagination
- Post detail pages
- Category pages
- Content-managed static pages
- Light and dark mode
- Payload admin setup for writing and publishing
- Site settings global
- Homepage global
- SEO metadata
- RSS feed
- Sitemap + robots
- Production-ready media storage plan

### Deferred to phase 2

- Search
- Newsletter signup
- Comments
- Related posts engine
- View counts / analytics dashboard
- Reading progress indicator
- Tag archives
- Live preview polish
- Dynamic OG image generation

---

## 19. Suggested Development Phases

### Phase 1 — Content model and foundation

- Define collections/globals
- Add access control
- Add slug and publish workflow
- Add front-end route skeletons
- Replace blank template homepage

### Phase 2 — Public blog UI

- Build homepage
- Build blog index
- Build post template
- Build category template
- Build pages template
- Add typography and design system

### Phase 3 — SEO and production readiness

- Metadata wiring
- Sitemap, robots, RSS
- Revalidation hooks/utilities
- Media storage provider
- Deployment config

### Phase 4 — Nice-to-haves

- search
- newsletter
- notes/projects
- preview improvements
- analytics

---

## 20. Recommended Decisions to Lock In Now

These are the choices I recommend we adopt before implementation:

1. **Deploy target:** Vercel
2. **Rendering model:** server components + cache-first public pages
3. **Blog URL structure:** `/blog/[slug]`
4. **Pages URL structure:** `/<slug>` for static CMS pages
5. **Author model:** single-author via `site-settings` for MVP
6. **Homepage model:** manually curated top section + automatic recent work section
7. **Theme strategy:** light and dark mode in v1 using CSS variables
8. **Styling:** minimal custom CSS, no heavy UI framework
9. **Editor model:** Lexical rich text, not a page builder
10. **Media storage in production:** S3-compatible provider
11. **Taxonomy:** categories in MVP, tags later if needed

---

## 21. Resolved Product Decisions

Confirmed so far:

1. The blog will stay **single-author** for v1.
2. The homepage will be **curated manually**, with a separate **Recent work** section that pulls the latest posts automatically.
3. **Dark mode** is included in v1.
4. **Newsletter signup** is deferred until later.
5. **Comments** are deferred until later.

### Finalized platform decision

1. **Vercel** is the primary deployment target for the first production deployment.

---

## 22. Final Recommendation

Build this as a **single-app Payload + Next.js personal blog** with:

- a simple, editorial content model
- a manually curated homepage plus an automatic recent work section
- server-rendered public pages
- strong caching and on-demand revalidation
- minimal client JavaScript
- light and dark mode in v1
- Vercel as the main deployment target
- Postgres for data and S3-compatible storage for assets

This approach is the best fit for your stated goals:

- clean design
- extremely fast public experience
- mostly server-side generated pages
- easy deployment and maintenance
