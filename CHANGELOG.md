# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-09-13

### Added
- Blog and Search pagination (10 posts per page) with Prev/Next navigation.
  - `src/app/(public)/blog/page.tsx`
  - `src/app/(public)/search/page.tsx`
  - `src/app/api/posts/route.ts` supports `?page` and `?limit`.
- Server-rendered Header with `isAdmin` computed from session roles and `ADMIN_EMAILS`.
  - `src/components/layout/header.tsx` (server wrapper)
  - `src/components/layout/header-client.tsx` (client UI)
- Debounced search input (150ms) to reduce re-renders while typing.
  - `src/app/(public)/search/page.tsx`
- Split Suspense boundaries for heavy sections on post detail to improve initial paint.
  - `src/app/(public)/blog/[slug]/page.tsx` wraps `CommentSection` and `RelatedPosts` in `<Suspense>`.
- Database indexes for common access patterns (faster queries at scale).
  - `posts(published, created_at)` → `idx_posts_published_created_at`
  - `posts_to_tags(tag_id)` → `idx_posts_to_tags_tag_id`
  - `analytics_events(path)` → `idx_analytics_events_path`

### Changed
- Unified header icons to `lucide-react` to reduce bundle size.
- Real read time computed on post page (words/200 wpm).
- Removed placeholder post fallback on blog list when DB is unavailable.

### Fixed
- Type and lint issues around header typing and client directive edge cases.

### Notes
- Run migrations to apply new indexes:
  - `pnpm db:generate && pnpm db:push`
- Consider server-side search with filters + pagination for further optimization.

