# Roadmap

This roadmap summarizes what is implemented today and what is planned next. It helps align documentation and future development for `next-blog-starterkit`.

## Current Implementation

- Admin
  - Admin app under `src/app/(admin)/admin/` with sections for Posts, Affiliate Links, Advertisements, and Analytics.
  - Access control via `ADMIN_EMAILS` allowlist in `middleware.ts` (interim until RBAC).
- Content & MDX
  - MDX rendering with shortcodes/components. Example usage in `src/app/(public)/blog/[slug]/page.tsx` and `src/lib/db/seed.ts`.
  - ToC generated via `remark-toc` and anchors via `rehype-slug`.
- Authentication
  - Better Auth with optional OAuth (Google, GitHub). If OAuth is not set, the public site still works.
- Storage
  - Cloudinary uploads by default through `src/app/api/upload/route.ts`.
  - Optional S3 provider implemented at `src/lib/storage/s3.ts` (not wired by default).
- Newsletter
  - Resend-based newsletter with subscribe/unsubscribe/status endpoints and UI in footer and account pages.
- Analytics
  - First‑party analytics pipeline (page views + custom events) with KPIs for Admin.
  - Vercel Analytics and Speed Insights supported via config.
- SEO & Feeds
  - Dynamic sitemap in `src/app/(public)/sitemap.ts` and RSS under `src/app/(public)/rss.xml/`.
- Internationalization
  - Optional `next-intl` structure under `src/i18n/` and `src/messages/`.

## Recent Changes (v1.1.0)

- Pagination
  - Blog and Search limited to 10 posts per page with Prev/Next navigation.
  - API `/api/posts` supports `?page` and `?limit` query parameters.
- Header SSR and Lighter Icons
  - Header rendered on the server; `isAdmin` derived from session roles and `ADMIN_EMAILS`.
  - Switched header icons to `lucide-react`.
- Search UX
  - Debounced search input (150ms) to reduce re-renders while typing.
- Post Page Rendering
  - Split `<Suspense>` boundaries for `CommentSection` and `RelatedPosts` with lightweight spinners to improve initial paint.
- Database Indexes
  - Added indexes for `posts(published, created_at)`, `posts_to_tags(tag_id)`, and `analytics_events(path)` to keep queries fast.
- Content Details
  - Real read-time computed on post pages (words/200 wpm).
  - Removed placeholder post fallback when DB is unavailable on the blog list.

## Planned / In Progress

- Reviews & Ratings (Planned)
  - Implement user reviews with star ratings (UI, DB schema, moderation, and analytics).
  - Acceptance: admin can view/moderate reviews; posts display average rating and review count.
- Storage Provider Switch (Planned)
  - Document and optionally wire an S3 upload route using `S3Provider.getPresignedUploadUrl()`.
  - Acceptance: env-based toggle between Cloudinary (default) and S3 paths; docs updated with steps.
- RBAC for Admin (In Progress)
  - Replace `ADMIN_EMAILS` allowlist with roles/permissions.
  - Current: middleware uses role checks for `/admin` when no allowlist is configured; header SSR derives `isAdmin` from session roles.
  - Acceptance: role-based middleware checks and role management in admin.
- Ads & Affiliate Enhancements (Planned)
  - Placement presets, impression/click analytics, and reporting.
  - Acceptance: admin dashboards show basic KPIs and allow CRUD with validation.
- Media Pipeline Improvements (Planned)
  - Optional adoption of an image component or `next-cloudinary` for responsive images.
  - Acceptance: example components and docs for responsive images and transformations.
- Editorial Workflow (Planned)
  - Draft → Review → Published; scheduled publishing; change history.
  - Acceptance: state transitions, schedule field, and admin filters.
- Documentation & Examples (Ongoing)
  - Expand docs for i18n usage, analytics customization, content authoring examples.
  - Add more seed data and integration tests for critical flows.
  - Performance notes captured in `CHANGELOG.md` and this `roadmap.md` (separate `docs/performance.md` removed).

## Backlog / Nice to Have

- Webhooks for newsletter and analytics sinks
- Multi-tenant/blog instances
- Visual MDX editor and component palette

## Versioning & Releases

- Changes are tracked in Git commits; consider introducing a `CHANGELOG.md` when features stabilize.

## How to Contribute

- File issues for bugs and doc gaps.
- Propose small PRs focused on one topic at a time (docs or a single feature), following the coding and documentation style used in this repository.
