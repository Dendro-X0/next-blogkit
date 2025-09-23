# Changelog

All notable changes to this project will be documented in this file.

## [1.2.1] - 2025-09-17

### Added
- Keyboard shortcuts to focus the header search: `/`, `Ctrl+K` (Windows/Linux) and `⌘K` (macOS), with inline hint badges and `aria-keyshortcuts` for accessibility.
  - `src/components/layout/header-client.tsx`
- Modern MDX/Markdown `.prose` typography for blog posts (larger responsive headings, improved spacing, lists, quotes, code, tables, images, and balanced margins).
  - `src/app/globals.css`
- Admin Post Editor Preview dialog that renders Markdown using the same `.prose` styles for WYSIWYG consistency.
  - `src/app/(admin)/admin/_components/post-editor.tsx`

### Changed
- Blog post page now uses the new `.prose` container for content rendering.
  - `src/app/(public)/blog/[slug]/page.tsx`
- Build script now uses Turbopack: `next build --turbopack`.
  - `package.json`

### Fixed
- Dev server failed to start with Turbopack due to non-serializable options in `@next/mdx`. Removed `@next/mdx` integration and `mdx` from `pageExtensions`.
  - `next.config.ts`
- Header not updating immediately after login. Passed server `initialUser` to `HeaderClient` for hydration-correct initial state while keeping reactive session updates.
  - `src/components/layout/header.tsx`
  - `src/components/layout/header-client.tsx`

## [1.2.0] - 2025-09-14

### Added
- Username support for authentication and profile:
  - Users can sign in using either email or username plus password.
  - Signup now collects a unique `username` with validation.
  - Profile settings allow editing `username` with format and uniqueness checks.

### Changed
- `LoginSchema` now accepts `identifier` (email or username) instead of `email`.
- `src/components/auth/login-form.tsx` updated to display an "Email or Username" field.
- `src/actions/login.ts` routes to `auth.api.signInEmail` or `auth.api.signInUsername` based on the identifier.
- `SignupSchema` extended with `username` rules.
- `src/actions/signup.ts` enforces username uniqueness (Drizzle) and passes `username`/`displayUsername` to Better Auth.
- `src/app/(account)/account/settings/_components/profile-settings.tsx` adds a `Username` field.
- `src/actions/user.ts` supports updating `username` with validation and uniqueness guard.

### Notes
- No DB migration required. `auth-schema.ts` already contains `user.username` (unique) and `displayUsername`.

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

