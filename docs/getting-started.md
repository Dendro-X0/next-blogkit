# Getting Started

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (local or remote)

## 1) Clone and install

```bash
git clone <repo-url>
cd next-blog-starterkit
pnpm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and fill the values you need. At a minimum set `DATABASE_URL`.

See docs/configuration.md for full variable descriptions.

## 3) Database

```bash
pnpm run db:migrate
# or
pnpm run db:push
```

Optional: seed data if the project includes a seeder script.

## 4) Run the dev server

```bash
pnpm run dev
```

Visit http://localhost:3000

## 5) Admin access

- Set `ADMIN_EMAILS` in your `.env` to allow admin access (comma‑separated list).
- Navigate to `/admin` once authenticated.

## 6) Production build

```bash
pnpm run build
pnpm run start
```

Deploy guidance is at docs/deployment.md.

## Try a different CMS provider (native / WordPress / Sanity)

Content is fetched through a CMS adapter selected by `CMS_PROVIDER`.

1) Copy `.env.local.example` to `.env.local`
2) Set `CMS_PROVIDER` to one of:
   - `native` (default)
   - `wordpress`
   - `sanity`
3) Fill the provider-specific environment variables (see docs/configuration.md)
4) Start the app:

```bash
pnpm run dev
```

Notes:

- When using `wordpress` or `sanity`, native-only features (comments, reactions, bookmarks, related posts) are disabled.
- Admin create/edit/delete works for WordPress/Sanity only if you provide the relevant credentials (`WORDPRESS_*` or `SANITY_TOKEN`).
