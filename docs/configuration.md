# Configuration

This page summarizes environment variables and toggles. Most providers are optional — when unset, features are disabled gracefully so the app can run locally without secrets.

## Core

- `NEXT_PUBLIC_APP_URL` — public base URL used in feeds and canonical URLs
- `DATABASE_URL` — PostgreSQL connection string

## CMS (Content Provider)

You can switch where posts/categories/tags come from by setting `CMS_PROVIDER`.

- `CMS_PROVIDER=native` (default)
  - Content is stored in the local database (Drizzle/Postgres)
  - Native-only features are enabled (comments, reactions, bookmarks, related posts)
- `CMS_PROVIDER=wordpress`
  - Content is fetched from WordPress REST API
  - Post body is treated as HTML (rendered safely)
- `CMS_PROVIDER=sanity`
  - Content is fetched from Sanity
  - Post body is treated as Markdown

### WordPress (when `CMS_PROVIDER=wordpress`)

- `WORDPRESS_URL` — base URL of your WP site (no trailing slash), e.g. `https://example.com`
- `WORDPRESS_USERNAME` — required for write operations (Admin create/edit/delete)
- `WORDPRESS_APP_PASSWORD` — required for write operations (Admin create/edit/delete)

### Sanity (when `CMS_PROVIDER=sanity`)

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_TOKEN` — required for write operations (Admin create/edit/delete)
- `SANITY_USE_CDN` — optional boolean

## Authentication (optional)

- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Admin Access (optional)

- `ADMIN_EMAILS` — comma‑separated allowlist for `/admin`

## Email

Choose one provider:

- Resend
  - `MAIL_PROVIDER=resend`
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
- SMTP (great for local testing with MailHog)
  - `MAIL_PROVIDER=smtp`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER?`, `SMTP_PASS?`

## File Storage

Uploads default to Cloudinary. An S3‑compatible provider is available but not enabled by default.

### Cloudinary (default)

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### S3 (optional)

- `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- `NEXT_PUBLIC_S3_PUBLIC_URL` — public CDN/base URL for serving files

## Analytics

- Vercel Analytics / Speed Insights require the Vercel integration

## Internationalization (optional)

- See `src/i18n` and `messages/` if using `next-intl`

For more details, see README and env.ts.
