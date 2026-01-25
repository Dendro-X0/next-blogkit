
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";
import { posts, user } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

// Try to load from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
    console.log("Starting seed script...");
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    const queryClient = postgres(process.env.DATABASE_URL);
    const db = drizzle(queryClient, { schema });

    // 1. Get or Create Author
    let author = await db.query.user.findFirst();

    if (!author) {
        console.log("No user found. Creating dummy admin user...");
        try {
            const result = await db.insert(user).values({
                id: "admin-seed-user",
                name: "Admin User",
                email: "admin@example.com",
                emailVerified: true,
                username: "admin",
                displayUsername: "Admin",
            }).returning();
            author = result[0];
        } catch (e) {
            console.error("Failed to create user:", e);
            // Attempt to fetch again in case of race condition or previous failed run
            author = await db.query.user.findFirst();
            if (!author) throw new Error("Could not create or find user");
        }
    }

    console.log(`Using author: ${author!.id} (${author!.email})`);

    // 2. Define Posts
    const postsData = [
        {
            title: "Modern Blog Starter Kit — Overview",
            slug: "overview",
            excerpt: "A production‑ready blog platform built on Next.js 16. It includes a full content pipeline (MDX rendering with shortcodes), rich admin tools, monetization primitives, authentication, S3 uploads, analytics, and strong defaults for performance and accessibility.",
            content: `
This repository is a production‑ready blog platform built on Next.js 16. It includes a full content pipeline (MDX rendering with shortcodes), rich admin tools, monetization primitives, authentication, S3 uploads, analytics, and strong defaults for performance and accessibility.

Use this guide to understand what’s included and how the parts fit together. For setup and environment configuration, see docs/configuration.md.

## Key Capabilities

- Framework: Next.js 16 (App Router), TypeScript
- Styling & UI: Tailwind CSS v4, shadcn/ui
- Content: MDX rendering, automated Table of Contents, audio posts
- Admin: Posts, categories, tags, affiliate links, ads
- Auth: Better Auth with optional OAuth providers (GitHub, Google)
- Storage: Cloudinary uploads by default; S3‑compatible storage optional (AWS S3, R2, MinIO)
- Email: Resend or SMTP (local MailHog) for newsletters/transactional mail
- Analytics: Vercel Analytics, Speed Insights, + first‑party events and KPIs dashboard
- SEO: Optimized images, dynamic sitemap, RSS

## High‑Level Architecture

- App Router routes in \`src/app/\` are organized by route groups:
  - \`src/app/(public)/\` public site: home, blog, search, contact, feeds
  - \`src/app/(account)/account/\` user dashboard and related pages (auth‑protected)
  - \`src/app/(admin)/admin/\` admin application (role/allowlist‑protected)
  - \`src/app/api/\` REST/route handlers for uploads, newsletter, etc.
- Server Actions in \`src/actions/\` implement write flows (create/update content, auth flows, etc.).
- Data access through Drizzle ORM in \`src/lib/db/*\` with PostgreSQL.
- Authentication via Better Auth in \`src/lib/auth/*\`.
- UI components in \`src/components/*\` grouped by feature (blog, ads, layout, theme, ui, mdx).
- Configuration in \`src/config/*\` (e.g., \`website.ts\`).
- First‑party analytics in \`src/analytics/\` with KPIs for admin.

## Typical Flows

- Content authoring:
  - Authors create/edit posts in the Admin area (\`/admin\`), upload images to S3, and compose content with MDX shortcodes.
  - Readers browse \`/blog\`, individual posts, or search; posts are server‑rendered and cached (ISR where appropriate).
- Authentication:
  - Optional—if OAuth not configured, public site still works; admin can be disabled or restricted via \`ADMIN_EMAILS\`.
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
      `.trim(),
            authorId: author!.id,
            published: true,
        },
        {
            title: "Architecture",
            slug: "architecture",
            excerpt: "This document explains the main modules, how they interact, and the patterns used throughout the codebase.",
            content: `
This document explains the main modules, how they interact, and the patterns used throughout the codebase.

## Routing & Layouts (App Router)

- Root layout: \`src/app/layout.tsx\`
- Route groups:
  - \`(public)\`: public‑facing pages (home, blog, search, auth pages, rss/sitemap)
  - \`(account)\`: authenticated user area
  - \`(admin)\`: administrator UI
- API routes: \`src/app/api/*\` for uploads, newsletter, etc.

Each route uses React Server Components by default; Client Components are used for interactivity. Places that use \`usePathname\`, \`useSearchParams\`, or client hooks are wrapped in \`Suspense\` to satisfy Next.js 16 rendering.

## Data Layer

- Database: PostgreSQL
- ORM: Drizzle (\`src/lib/db/*\`) with schema, migrations, and a \`migrate.ts\` entrypoint.
- Access patterns: use typed queries and return typed DTOs to components.

## Authentication

- Provider: Better Auth (\`src/lib/auth/*\`)
- Optional OAuth providers (GitHub/Google) are controlled via env vars. When not configured, the rest of the site still works; admin can be disabled or limited via \`ADMIN_EMAILS\`.

## Content Pipeline

- MDX rendering via \`@next/mdx\`/\`next-mdx-remote\` and components in \`src/components/mdx/*\`.
- Table of Contents via \`remark-toc\` and headings via \`rehype-slug\`/\`rehype-autolink-headings\`.
- Posts are stored in the database and the body is rendered as MDX with shortcodes.

## Media & Storage

- Image uploads: S3 compatible providers (AWS S3, Cloudflare R2). Upload endpoints live in \`src/app/api/*\` and helpers in \`src/lib/storage/*\`.
- Optimization: Cloudinary via \`next-cloudinary\` or Next.js Image when appropriate.

## Emails & Newsletter

- Providers: Resend for production or SMTP (MailHog) for local testing.
- Email templates: \`src/emails/*\` via \`react-email\`.
- Newsletter subscribe endpoints in \`src/app/api/*\`.

## Analytics

- Vercel Analytics and Speed Insights in \`src/analytics/*\`.
- First‑party analytics pipeline (page views + custom events) with summaries/KPIs in the admin dashboard.

## Caching & Rendering Strategy

- Pages under \`/blog\` commonly use ISR with \`export const revalidate = <seconds>\`.
- Server components fetch data directly via Drizzle for stable prerenders.
- Avoid calling internal API routes during prerender unless you construct absolute URLs via \`headers()\`.

## Security & Access Control

- Middleware: \`middleware.ts\` for auth checks and admin gating.
- Interim allowlist: \`ADMIN_EMAILS\` env var restricts \`/admin\` until RBAC is introduced.

## Conventions

- Project uses strict TypeScript.
- Components live under \`src/components/*\` and are colocated by feature.
- Tailwind utility‑first with minimal custom CSS in \`src/app/globals.css\`.
      `.trim(),
            authorId: author!.id,
            published: true,
        },
        {
            title: "Configuration",
            slug: "configuration",
            excerpt: "This page summarizes environment variables and toggles. Most providers are optional — when unset, features are disabled gracefully.",
            content: `
This page summarizes environment variables and toggles. Most providers are optional — when unset, features are disabled gracefully so the app can run locally without secrets.

## Core

- \`NEXT_PUBLIC_APP_URL\` — public base URL used in feeds and canonical URLs
- \`DATABASE_URL\` — PostgreSQL connection string

## Authentication (optional)

- \`GITHUB_CLIENT_ID\`, \`GITHUB_CLIENT_SECRET\`
- \`GOOGLE_CLIENT_ID\`, \`GOOGLE_CLIENT_SECRET\`

## Admin Access (optional)

- \`ADMIN_EMAILS\` — comma‑separated allowlist for \`/admin\`

## Email

Choose one provider:

- Resend
  - \`MAIL_PROVIDER=resend\`
  - \`RESEND_API_KEY\`
  - \`EMAIL_FROM\`
- SMTP (great for local testing with MailHog)
  - \`MAIL_PROVIDER=smtp\`
  - \`SMTP_HOST\`, \`SMTP_PORT\`, \`SMTP_SECURE\`, \`SMTP_USER?\`, \`SMTP_PASS?\`

## File Storage

Uploads default to Cloudinary. An S3‑compatible provider is available but not enabled by default.

### Cloudinary (default)

- \`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME\`
- \`CLOUDINARY_API_KEY\`
- \`CLOUDINARY_API_SECRET\`

### S3 (optional)

- \`S3_REGION\`, \`S3_ACCESS_KEY_ID\`, \`S3_SECRET_ACCESS_KEY\`, \`S3_BUCKET_NAME\`
- \`NEXT_PUBLIC_S3_PUBLIC_URL\` — public CDN/base URL for serving files

## Analytics

- Vercel Analytics / Speed Insights require the Vercel integration

## Internationalization (optional)

- See \`src/i18n\` and \`messages/\` if using \`next-intl\`

For more details, see README and env.ts.
      `.trim(),
            authorId: author!.id,
            published: true,
        },
    ];

    // 3. Insert Posts
    for (const p of postsData) {
        const existing = await db.query.posts.findFirst({
            where: eq(posts.slug, p.slug)
        });
        if (existing) {
            console.log(`Post '${p.slug}' already exists. Skipping.`);
            continue;
        }
        await db.insert(posts).values(p);
        console.log(`Created post: ${p.title}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1); // Exit with error code so CI/CD processes know it failed
});
