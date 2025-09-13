# Modern Blog Starter Kit

![CI](https://github.com/Dendro-X0/next-blog-starterkit/actions/workflows/ci.yml/badge.svg)
 
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDendro-X0%2Fnext-blog-starterkit&project-name=next-blog-starterkit&repository-name=next-blog-starterkit&env=NEXT_PUBLIC_APP_URL,DATABASE_URL,BETTER_AUTH_SECRET,MAIL_PROVIDER,RESEND_API_KEY,EMAIL_FROM&envDescription=Required%20variables%20for%20production%20build.%20Use%20MAIL_PROVIDER%3Dresend%20with%20RESEND_API_KEY%20and%20EMAIL_FROM%2C%20or%20set%20MAIL_PROVIDER%3Dsmtp%20and%20fill%20SMTP_*.&envLink=https%3A%2F%2Fgithub.com%2FDendro-X0%2Fnext-blog-starterkit%23-3-environment-variables)

Modern, production‑ready blog platform built with Next.js 15 and TypeScript—MDX content, admin dashboard, Better Auth, Cloudinary uploads by default (S3 optional), and built‑in analytics. Clean architecture, fast by default, and easy to extend.

## Features

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Better Auth (GitHub & Google providers; optional and auto-disabled if not configured)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4 with Shadcn UI
- **Content**: MDX, advanced post formats (audio), and automated Table of Contents.
- **Admin Panel**: Manage posts, categories, tags, affiliate links, and advertisements.
- **Monetization**: Affiliate dashboard and Ad management system.
- **Performance & SEO**: Advanced caching, Cloudinary image optimization, and a dynamic sitemap.
- **File Storage**: Cloudinary uploads by default; optional S3-compatible storage.
- **User Engagement**: Newsletter subscription system (Resend).
- **Analytics**: Vercel Analytics, Speed Insights, and a first‑party analytics pipeline (pageviews + custom events) with an admin KPIs dashboard.
- **Theming**: Light/Dark mode support.

## Documentation

This repository now includes a `docs/` directory with topic-focused guides:

- Overview: [docs/overview.md](docs/overview.md)
- Getting Started: [docs/getting-started.md](docs/getting-started.md)
- Configuration (env vars): [docs/configuration.md](docs/configuration.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Content Authoring (MDX, ToC, media): [docs/content-authoring.md](docs/content-authoring.md)
- Admin Guide: [docs/admin-guide.md](docs/admin-guide.md)
- Storage (S3/Cloudinary): [docs/storage.md](docs/storage.md)
- Analytics (first-party + Vercel): [docs/analytics.md](docs/analytics.md)
- Mobile & Accessibility: [docs/a11y-mobile.md](docs/a11y-mobile.md)
- Internationalization (optional): [docs/internationalization.md](docs/internationalization.md)
- Deployment: [docs/deployment.md](docs/deployment.md)
 - Roadmap: [roadmap.md](roadmap.md)

## Quick Start

1) Read the short guide: [docs/getting-started.md](docs/getting-started.md)
2) Configure environment: [docs/configuration.md](docs/configuration.md)
3) Run it:

```bash
pnpm install
pnpm run db:migrate
pnpm run dev
```

More topics: architecture, content authoring (MDX), admin, storage, analytics, A11y/mobile, i18n — see the Documentation links above.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
