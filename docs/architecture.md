# Architecture

This document explains the main modules, how they interact, and the patterns used throughout the codebase.

## Routing & Layouts (App Router)

- Root layout: `src/app/layout.tsx`
- Route groups:
  - `(public)`: public‑facing pages (home, blog, search, auth pages, rss/sitemap)
  - `(account)`: authenticated user area
  - `(admin)`: administrator UI
- API routes: `src/app/api/*` for uploads, newsletter, etc.

Each route uses React Server Components by default; Client Components are used for interactivity. Places that use `usePathname`, `useSearchParams`, or client hooks are wrapped in `Suspense` to satisfy Next.js 16 rendering.

## Data Layer

- Database: PostgreSQL
- ORM: Drizzle (`src/lib/db/*`) with schema, migrations, and a `migrate.ts` entrypoint.
- Access patterns: use typed queries and return typed DTOs to components.

## Authentication

- Provider: Better Auth (`src/lib/auth/*`)
- Optional OAuth providers (GitHub/Google) are controlled via env vars. When not configured, the rest of the site still works; admin can be disabled or limited via `ADMIN_EMAILS`.

## Content Pipeline

- MDX rendering via `@next/mdx`/`next-mdx-remote` and components in `src/components/mdx/*`.
- Table of Contents via `remark-toc` and headings via `rehype-slug`/`rehype-autolink-headings`.
- Posts are stored in the database and the body is rendered as MDX with shortcodes.

## Media & Storage

- Image uploads: S3 compatible providers (AWS S3, Cloudflare R2). Upload endpoints live in `src/app/api/*` and helpers in `src/lib/storage/*`.
- Optimization: Cloudinary via `next-cloudinary` or Next.js Image when appropriate.

## Emails & Newsletter

- Providers: Resend for production or SMTP (MailHog) for local testing.
- Email templates: `src/emails/*` via `react-email`.
- Newsletter subscribe endpoints in `src/app/api/*`.

## Analytics

- Vercel Analytics and Speed Insights in `src/analytics/*`.
- First‑party analytics pipeline (page views + custom events) with summaries/KPIs in the admin dashboard.

## Caching & Rendering Strategy

- Pages under `/blog` commonly use ISR with `export const revalidate = <seconds>`.
- Server components fetch data directly via Drizzle for stable prerenders.
- Avoid calling internal API routes during prerender unless you construct absolute URLs via `headers()`.

## Security & Access Control

- Middleware: `middleware.ts` for auth checks and admin gating.
- Interim allowlist: `ADMIN_EMAILS` env var restricts `/admin` until RBAC is introduced.

## Conventions

- Project uses strict TypeScript.
- Components live under `src/components/*` and are colocated by feature.
- Tailwind utility‑first with minimal custom CSS in `src/app/globals.css`.
