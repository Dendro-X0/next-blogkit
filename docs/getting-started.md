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
