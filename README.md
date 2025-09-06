# Modern Blog Starter Kit

![CI](https://github.com/Dendro-X0/next-blog-starterkit/actions/workflows/ci.yml/badge.svg)
 
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDendro-X0%2Fnext-blog-starterkit&project-name=next-blog-starterkit&repository-name=next-blog-starterkit&env=NEXT_PUBLIC_APP_URL,DATABASE_URL,BETTER_AUTH_SECRET,MAIL_PROVIDER,RESEND_API_KEY,EMAIL_FROM&envDescription=Required%20variables%20for%20production%20build.%20Use%20MAIL_PROVIDER%3Dresend%20with%20RESEND_API_KEY%20and%20EMAIL_FROM%2C%20or%20set%20MAIL_PROVIDER%3Dsmtp%20and%20fill%20SMTP_*.&envLink=https%3A%2F%2Fgithub.com%2FDendro-X0%2Fnext-blog-starterkit%23-3-environment-variables)

Production-ready blog starter built with Next.js 15, TypeScript, Tailwind, and Drizzle. Clean architecture, fast by default, and easy to extend.

## Features

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Better Auth (GitHub & Google providers; optional and auto-disabled if not configured)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4 with Shadcn UI
- **Content**: MDX, advanced post formats (audio), and automated Table of Contents.
- **Admin Panel**: Manage posts, categories, tags, affiliate links, and advertisements.
- **Monetization**: Affiliate dashboard and Ad management system.
- **Performance & SEO**: Advanced caching, Cloudinary image optimization, and a dynamic sitemap.
- **File Storage**: S3-compatible image uploads.
- **User Engagement**: User reviews with star ratings and a newsletter subscription system (Resend).
- **Analytics**: Vercel Analytics, Speed Insights, and a first‑party analytics pipeline (pageviews + custom events) with an admin KPIs dashboard.
- **Theming**: Light/Dark mode support.

## Project Status

- Complete. Ready for production.
- Type-safe throughout (strict TS), passes ESLint, and builds cleanly.
- Suspense-compliant for Next.js 15.
- Includes Auth, Admin, MDX content, Comments & Reactions, Analytics, S3 uploads.

## Known Issues

None blocking. If you see a Suspense-related warning, see Build & Rendering Notes.

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

- Node.js (v18 or later)
- pnpm
- A local or remote PostgreSQL database

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-name>
pnpm install
```

### 3. Environment Variables

Create a `.env` file by copying the contents of `.env.example`. You will need to add your database connection string at a minimum. Other services can be configured as needed.

**Note**: Most environment variables are optional. Providers auto-disable if credentials are not set (e.g., GitHub/Google OAuth). This keeps CI and fresh clones building without secrets.

```bash
# .env

# Database (Required)
DATABASE_URL="postgresql://user:password@host:port/db"

# Authentication (Optional; leave unset to disable GitHub login)
# GITHUB_CLIENT_ID="..."
# GITHUB_CLIENT_SECRET="..."

# Admin (optional quick allowlist for /admin)
# Comma-separated list of emails allowed to access the admin dashboard.
# Leave unset to allow any authenticated user (default behavior pre-RBAC).
ADMIN_EMAILS="admin@example.com,owner@example.com"

# Email Provider (choose one)
# Resend
MAIL_PROVIDER="resend"
RESEND_API_KEY="..."
EMAIL_FROM="no-reply@example.com"

# SMTP (e.g., MailHog locally)
# MAIL_PROVIDER="smtp"
# SMTP_HOST="127.0.0.1"
# SMTP_PORT="1025"
# SMTP_SECURE="false"
# SMTP_USER=""    # optional
# SMTP_PASS=""    # optional

# File Storage (Optional)
S3_REGION="..."
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="..."
NEXT_PUBLIC_S3_PUBLIC_URL="..."
```

The optional `ADMIN_EMAILS` guard lets you restrict `/admin` access only to listed emails until full role-based access control (RBAC) is introduced. If `ADMIN_EMAILS` is not set, any authenticated user can open the admin dashboard (current baseline behavior).

### 4. Database Setup

Run the database migrations to set up your schema:

```bash
pnpm run db:migrate
```

### 5. Run the Development Server

Start the Next.js development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

### 6. Production Build & Run

Build and start the optimized production server:

```bash
pnpm run build
pnpm start
```

### 7. Enable First‑Party Analytics (Optional)

First‑party analytics is feature‑gated. You can enable it in `src/config/website.ts`:

```ts
export const websiteConfig = {
  analytics: {
    enableVercelAnalytics: true,
    enableSpeedInsights: true,
    enableFirstPartyAnalytics: true,
  },
};
```

### 8. Deploy to Vercel

Click the "Deploy with Vercel" button above or deploy manually:

1. Create a new Vercel project from this repo.
2. Set the following environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL, e.g. `https://your-app.vercel.app`
   - `DATABASE_URL` → PostgreSQL connection string
   - `BETTER_AUTH_SECRET` → a random 32+ char string
   - Email provider:
     - Resend: set `MAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM`
     - SMTP: set `MAIL_PROVIDER=smtp`, and provide `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE=false`, `EMAIL_FROM`, and optionally `SMTP_USER`/`SMTP_PASS`
   - Optional OAuth providers (auto-disabled if unset): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. Trigger a redeploy.

## Project Structure

The project follows a feature-first organization inside the `src` directory. Here's an overview of the key directories:

- `src/app`: Next.js App Router with route groups:
  - `(public)/` → public routes (`/`, `/blog`, `/search`, `/contact`, `/auth`, `/rss.xml`, `/sitemap.xml`, etc.)
  - `(account)/account/` → authenticated user area (`/account/*`, includes `profile`, `settings`, `comments`, `bookmarks`, `subscriptions`)
  - `(admin)/admin/` → admin-only routes (`/admin/*`)
  - Root `layout.tsx`, `globals.css`, and `middleware.ts` live at `src/app/`.
- `src/analytics`: Analytics integration (Vercel Analytics, AutoPageview, dev toggle) and types/helpers for first‑party events.
- `src/components`: Contains all reusable React components, organized by feature (e.g., `ads`, `blog`, `layout`).
- `src/config`: Holds project-wide configuration files, such as `website.ts`.
- `src/lib`: Includes utility functions and library initializations (e.g., `auth.ts`, `db.ts`).
- `middleware.ts`: Handles authentication checks and route protection.

```text
src/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx               # Home
│  │  ├─ blog/                  # Public blog pages
│  │  ├─ search/                # Site search
│  │  ├─ contact/               # Contact page & API
│  │  ├─ auth/                  # Login/Register/2FA/etc.
│  │  ├─ rss.xml/               # RSS route
│  │  └─ sitemap.ts             # Sitemaps
│  ├─ (account)/
│  │  └─ account/               # User area, auth-protected
│  │     ├─ layout.tsx
│  │     ├─ page.tsx            # Dashboard
│  │     ├─ bookmarks/
│  │     ├─ comments/
│  │     ├─ profile/
│  │     ├─ settings/
│  │     └─ subscriptions/
│  ├─ (admin)/
│  │  └─ admin/                 # Admin-only area
│  │     ├─ page.tsx
│  │     ├─ advertisements/
│  │     ├─ affiliate-links/
│  │     ├─ analytics/
│  │     └─ posts/
│  └─ api/                      # REST/route handlers
├─ components/                  # Reusable UI (shadcn/ui)
├─ analytics/                   # Vercel + first‑party analytics
├─ config/                      # website.ts and app config
├─ lib/                         # db, auth, newsletter, storage
├─ emails/                      # react-email templates
├─ actions/                     # server actions
├─ hooks/                       # shared hooks
├─ i18n/                        # next-intl (optional)
└─ messages/                    # translations (optional)
```

## Build & Rendering Notes (Next.js 15)

- Suspense requirements: Any page/component using `useSearchParams`, `usePathname`, or other client routing hooks must be wrapped in a React `Suspense` boundary. The root `layout.tsx` also wraps `Header`, `children`, `Footer`, and analytics blocks in `Suspense` to satisfy this during prerender.
- ISR on blog index: The `/blog` page uses `export const revalidate = 60` and queries the database directly via Drizzle for prerender stability and performance.
- If you must call API routes during prerender, construct an absolute URL using `headers()` to read the current host and protocol to avoid `ERR_INVALID_URL`.

## Optional Extras

These are nice-to-haves you can enable or extend as needed:

- Storybook for UI development.
- Social sharing enhancements and gamification.
- Payment/subscriptions (Stripe/Lemon Squeezy) if you want premium content.
- Multi‑provider analytics (Plausible/Umami) alongside first‑party analytics.
- Further a11y polishing and dark-mode contrast tuning.

## Email Setup (Resend or SMTP)

Configure email using either Resend or SMTP.

- **Resend (recommended for prod)**
  - Set `MAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM`.
- **SMTP (great for local testing)**
  - `docker compose up -d mailhog` (see `docker-compose.yml`) exposes:
    - SMTP: `127.0.0.1:1025`
    - Web UI: http://localhost:8025
  - Set `MAIL_PROVIDER=smtp`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, `EMAIL_FROM`.

In production, the app validates required vars based on your provider selection. See `env.ts` for details.

## Notes

- OAuth providers are optional; if not configured, the app builds and runs without them.
- Email sending is optional; if not configured, newsletter and transactional mails are disabled.
- Admin access is gated by `ADMIN_EMAILS` (interim allowlist) until RBAC is introduced.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
