# Content Authoring

This project renders blog posts with MDX and provides an Admin UI to manage posts, categories, tags, and media.

## Post Model

- Title, slug, excerpt/description
- Body (MDX)
- Hero image and gallery
- Category and tags
- SEO: canonical URL, open graph fields
- Status: draft/published
- Timestamps: created/updated

## Admin Workflow

1. Go to `/admin` (ensure your email is allowed via `ADMIN_EMAILS`).
2. Create or edit a post, upload images (S3), and compose with MDX.
3. Save as draft or publish.

## MDX Shortcodes & Components

Common shortcodes are available under `src/components/mdx/*` and general UI under `src/components/ui/*`.
Examples you can embed inside MDX:

- Custom Callouts/Alerts
- Image/video blocks
- Code blocks with syntax highlighting
- Affiliate cards / ad placements

## Table of Contents

A ToC is generated using `remark-toc` with heading anchors created by `rehype-slug` and autolinks.

## Media

- Images are uploaded to S3 and referenced in MDX by their public URL.
- Cloudinary optimization can be applied on the front‑end (via `next-cloudinary`) for fast delivery.

## Search & Indexing

- The `/blog` and `/search` pages fetch directly via Drizzle.
- RSS and sitemaps are generated under `src/app/(public)/rss.xml/` and `src/app/(public)/sitemap.ts`.
