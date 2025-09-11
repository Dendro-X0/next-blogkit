# Admin Guide

The Admin area lives at `/admin` under `src/app/(admin)/admin/`.

## Access Control

- By default, authenticated users may access the admin dashboard.
- To restrict to specific users, set `ADMIN_EMAILS` in `.env` with a comma‑separated list.
- RBAC is planned but not required for this starter.

## Features

- Posts: create, edit, schedule, publish, archive
- Categories & Tags: organize content
- Media: upload images to S3 and reuse across posts
- Ads & Affiliates: manage placements and partner links
- Analytics: view KPIs and recent activity

## Tips

- Prefer descriptive slugs (kebab‑case)
- Keep hero images <1MB where possible; use Cloudinary transformations for thumb variants
- Use draft status until you’re ready to publish
