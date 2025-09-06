# Modern Blog Starter Kit

![CI](https://github.com/Dendro-X0/next-blog-starterkit/actions/workflows/ci.yml/badge.svg)

Production-ready blog starter built with Next.js 15, TypeScript, Tailwind, and Drizzle. Clean architecture, fast by default, and easy to extend.

## Features

-   **Framework**: Next.js 15 (App Router)
-   **Authentication**: Better Auth (GitHub & Google providers)
-   **Database**: PostgreSQL with Drizzle ORM
-   **Styling**: Tailwind CSS v4 with Shadcn UI
-   **Content**: MDX, advanced post formats (audio), and automated Table of Contents.
-   **Admin Panel**: Manage posts, categories, tags, affiliate links, and advertisements.
-   **Monetization**: Affiliate dashboard and Ad management system.
-   **Performance & SEO**: Advanced caching, Cloudinary image optimization, and a dynamic sitemap.
-   **File Storage**: S3-compatible image uploads.
-   **User Engagement**: User reviews with star ratings and a newsletter subscription system (Resend).
-   **Analytics**: Vercel Analytics, Speed Insights, and a first‑party analytics pipeline (pageviews + custom events) with an admin KPIs dashboard.
-   **Theming**: Light/Dark mode support.

## Project Status

-   Complete. Ready for production.
-   Type-safe throughout (strict TS), passes ESLint, and builds cleanly.
-   Suspense-compliant for Next.js 15.
-   Includes Auth, Admin, MDX content, Comments & Reactions, Analytics, S3 uploads.

## Known Issues

None blocking. If you see a Suspense-related warning, see Build & Rendering Notes.

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

-   Node.js (v18 or later)
-   pnpm
-   A local or remote PostgreSQL database

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-name>
pnpm install
```

### 3. Environment Variables

Create a `.env` file by copying the contents of `.env.example`. You will need to add your database connection string at a minimum. Other services can be configured as needed.

**Note**: All environment variables are properly handled with appropriate fallbacks. The application can run with minimal configuration for basic functionality.

```bash
# .env

# Database (Required)
DATABASE_URL="postgresql://user:password@host:port/db"

# Authentication (Optional for running, required for login)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

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
} as const;
```

- In production, `AutoPageview` is mounted automatically when enabled.
- In development, a floating toggle appears to enable/disable auto‑pageviews without affecting production.

## Project Structure

The project follows a feature-first organization inside the `src` directory. Here's an overview of the key directories:

-   `src/app`: Contains the application's routes, layouts, and pages, following the Next.js App Router structure.
-   `src/analytics`: Analytics integration (Vercel Analytics, AutoPageview, dev toggle) and types/helpers for first‑party events.
-   `src/components`: Contains all reusable React components, organized by feature (e.g., `ads`, `blog`, `layout`).
-   `src/config`: Holds project-wide configuration files, such as `website.ts`.
-   `src/lib`: Includes utility functions and library initializations (e.g., `auth.ts`, `db.ts`).
-   `middleware.ts`: Handles authentication checks and route protection.

## Internationalization (i18n)

This starter ships with next-intl configured without i18n routing. UI copy is translatable; URLs remain unchanged. You can enable full routed i18n later with a small, documented change.

Default (no routing)
- Provider is wired in `src/app/layout.tsx` using `NextIntlClientProvider`.
- Request-scoped config in `src/i18n/request.ts` reads a `LOCALE` cookie and falls back to `en`.
- Messages live in `src/messages/<locale>.json` (TypeScript JSON imports enabled).

Language switcher (cookie-based)
- A compact switcher is provided and placed in the header:
  - `src/components/i18n/language-switcher.tsx`
  - Server action: `src/i18n/set-locale.ts` (sets `LOCALE` cookie)
  - Shared config: `src/i18n/config.ts`

Using translations
```tsx
// Client component
'use client'
import {useTranslations} from 'next-intl'

export default function Example() {
  const t = useTranslations('Common')
  return <button>{t('submit')}</button>
}
```

```tsx
// Server component
import {getTranslations} from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('Common')
  return <p>{t('loading')}</p>
}
```

Add a new locale
1) Create `src/messages/<locale>.json` (e.g., `es.json`).
2) Add the locale to `src/i18n/config.ts` in the `locales` list.
3) The cookie-based switcher and request config will start serving messages for that locale.

Upgrade to i18n routing (optional)
If you need locale-prefixed URLs and SEO (hreflang), switch to routed i18n:
- Add `src/i18n/routing.ts` exporting `locales` and `defaultLocale`.
- Add a `middleware.ts` to handle locale prefixes or domain routing (per next-intl docs).
- Replace Next.js navigation imports with next-intl helpers (e.g., `createNavigation`).
- Emit localized metadata and `hreflang` where appropriate.

This keeps the default simple while offering a clean path to full multilingual sites.

Removing i18n

Because the i18n setup is modular, you can remove it completely with these steps:

1.  **Delete i18n files**: Remove `src/i18n`, `src/messages`, and `src/components/i18n/language-switcher.tsx`.
2.  **Uninstall `next-intl`**: Run `npm uninstall next-intl`.
3.  **Update `layout.tsx`**: Remove the `NextIntlClientProvider` and related imports from `src/app/layout.tsx`.
4.  **Update `page.tsx`**: In `src/app/page.tsx`, remove `getTranslations` and replace the `t('key')` calls with static text.

## Build & Rendering Notes (Next.js 15)

- Suspense requirements: Any page/component using `useSearchParams`, `usePathname`, or other client routing hooks must be wrapped in a React `Suspense` boundary. The root `layout.tsx` also wraps `Header`, `children`, `Footer`, and analytics blocks in `Suspense` to satisfy this during prerender.
- ISR on blog index: The `/blog` page uses `export const revalidate = 60` and queries the database directly via Drizzle for prerender stability and performance.
- Prefer direct server data access in app routes. If you choose to fetch from API routes during prerender, construct an absolute URL instead of a relative one to avoid `ERR_INVALID_URL`:

```tsx
import { headers } from 'next/headers'

async function getAbsolute(url: string): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = (h.get('x-forwarded-proto') ?? 'https').split(',')[0]
  return `${proto}://${host}${url}`
}

const res = await fetch(await getAbsolute('/api/posts'), { next: { revalidate: 60 } })
```

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
