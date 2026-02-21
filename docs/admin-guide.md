# Admin Guide

The Admin area lives at `/admin` under `src/app/(admin)/admin/`.

## Access Control

- By default, authenticated users may access the admin dashboard.
- To restrict to specific users, set `ADMIN_EMAILS` in `.env` with a comma‑separated list.
- RBAC is planned but not required for this starter.

## CMS Provider

The Admin UI writes posts through the CMS adapter selected by `CMS_PROVIDER`.

- `CMS_PROVIDER=native`
  - Posts are stored in the local database.
  - Native-only features like comments, reactions, bookmarks, and “related posts” are available.
- `CMS_PROVIDER=wordpress`
  - Admin create/edit/delete requires `WORDPRESS_USERNAME` + `WORDPRESS_APP_PASSWORD`.
- `CMS_PROVIDER=sanity`
  - Admin create/edit/delete requires `SANITY_TOKEN`.

## Features

- Posts: create, edit, schedule, publish, archive
- Categories & Tags: organize content
- Media: upload images (Cloudinary by default; S3 optional) and reuse across posts
- Ads & Affiliates: manage placements and partner links
- Analytics: view KPIs and recent activity

## Tips

- Prefer descriptive slugs (kebab‑case)
- Keep hero images <1MB where possible; use Cloudinary transformations for thumb variants
- Use draft status until you’re ready to publish
