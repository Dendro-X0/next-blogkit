# Modern Blog Starter Kit — Overview

This repository is a production‑ready blog platform built on Next.js 15. It includes a full content pipeline (MDX rendering with shortcodes), rich admin tools, monetization primitives, authentication, S3 uploads, analytics, and strong defaults for performance and accessibility.

Use this guide to understand what’s included and how the parts fit together. For setup and environment configuration, see docs/configuration.md.

## Key Capabilities

- Framework: Next.js 15 (App Router), TypeScript
- Styling & UI: Tailwind CSS v4, shadcn/ui
- Content: MDX rendering, automated Table of Contents, audio posts
- Admin: Posts, categories, tags, affiliate links, ads
- Auth: Better Auth with optional OAuth providers (GitHub, Google)
- Storage: Cloudinary uploads by default; S3‑compatible storage optional (AWS S3, R2, MinIO)
- Email: Resend or SMTP (local MailHog) for newsletters/transactional mail
- Analytics: Vercel Analytics, Speed Insights, + first‑party events and KPIs dashboard
- SEO: Optimized images, dynamic sitemap, RSS

## High‑Level Architecture

- App Router routes in `src/app/` are organized by route groups:
  - `src/app/(public)/` public site: home, blog, search, contact, feeds
  - `src/app/(account)/account/` user dashboard and related pages (auth‑protected)
  - `src/app/(admin)/admin/` admin application (role/allowlist‑protected)
  - `src/app/api/` REST/route handlers for uploads, newsletter, etc.
- Server Actions in `src/actions/` implement write flows (create/update content, auth flows, etc.).
- Data access through Drizzle ORM in `src/lib/db/*` with PostgreSQL.
- Authentication via Better Auth in `src/lib/auth/*`.
- UI components in `src/components/*` grouped by feature (blog, ads, layout, theme, ui, mdx).
- Configuration in `src/config/*` (e.g., `website.ts`).
- First‑party analytics in `src/analytics/` with KPIs for admin.

## Typical Flows

- Content authoring:
  - Authors create/edit posts in the Admin area (`/admin`), upload images to S3, and compose content with MDX shortcodes.
  - Readers browse `/blog`, individual posts, or search; posts are server‑rendered and cached (ISR where appropriate).
- Authentication:
  - Optional—if OAuth not configured, public site still works; admin can be disabled or restricted via `ADMIN_EMAILS`.
- Newsletter:
  - Users sign up via a form; emails are delivered via Resend or SMTP depending on configuration.

## Where To Go Next

- docs/getting-started.md — install, run, seed, and test locally
- docs/architecture.md — deeper dive into modules and patterns
- docs/content-authoring.md — post model, MDX shortcodes, and rich media
- docs/admin-guide.md — using the Admin dashboard
- docs/configuration.md — environment variables and feature flags
- docs/deployment.md — deploying to Vercel and other platforms
- docs/analytics.md — first‑party events and KPIs
- docs/storage.md — S3 uploads and Cloudinary optimization
- docs/a11y-mobile.md — mobile and accessibility guidance
- docs/internationalization.md — next‑intl integration (optional)
