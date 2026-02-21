# Changelog

All notable changes to this project will be documented in this file.

## [1.3.6] - 2026-02-21

### Added
- Pluggable CMS adapter with provider selection via `CMS_PROVIDER`.
  - Providers: `native`, `wordpress`, `sanity`.
  - Public routes (blog, post page, search, RSS, sitemap) and admin post APIs now fetch content through the adapter.
- Environment variables for external CMS providers.
  - WordPress: `WORDPRESS_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD`.
  - Sanity: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION`, `SANITY_TOKEN`, `SANITY_USE_CDN`.

### Notes
- For v1, WordPress post bodies are treated as HTML (sanitized) and Sanity post bodies are treated as Markdown (no MDX shortcode support).
- Native-only features (comments, reactions, bookmarks, related posts) are gated to `CMS_PROVIDER=native`.

## [1.3.5] - 2026-01-24

### Added
- Comprehensive skeleton loading system across all public routes for a smoother perceived performance.
  - Custom loaders for Blog (grid), Post (article), Search, Contact, and Auth forms.
  - `src/components/blog/blog-skeletons.tsx`
  - `src/components/ui/search-skeletons.tsx`
  - `src/components/ui/contact-skeleton.tsx`
  - `src/components/auth/auth-skeleton.tsx`
- Interactive active filter chips in the Search page to allow users to quickly view and clear selected categories, authors, and tags.
- Dedicated standalone layout for Auth pages to remove global navigation and focus on the authentication flow.
- "Back to home" navigation in the Auth layout with hover animations.

### Changed
- Major redesign of the Contact page featuring a symmetrical two-column layout with integrated FAQ and improved spacing.
- Refined Blog Post Cards with glassmorphism effects (`backdrop-blur-xs`), subtle lift-on-hover animations, and improved tag visibility.
- Optimized global prose typography: reduced line-height to `1.7` and tightened vertical rhythm for better readability.
- Re-implemented the Header with scroll-dependent styling; bottom border and background blur now only appear after scrolling.
- Restructured route groups: separated `(auth)` from `(public)` to allow for distinct layout shells.

### Fixed
- Select component width issues in forms by enforcing `w-full` on triggers.
- Syntax error in `Skeleton` component JSX attribute spreading.
- Inconsistent grid layouts between blog lists and their corresponding skeleton loaders.

## [1.3.3] - 2025-12-29

### Added
- JSON-LD structured data component and global manifest/robots configuration to boost Lighthouse SEO signals.
  - `src/components/ui/structured-data.tsx`
  - `public/manifest.json`
  - `public/robots.txt`

### Changed
- Home page metadata and hero imagery optimisations (priority/fetchPriority, lazy-loaded mobile previews, descriptive CTA link labels) to reduce LCP and satisfy descriptive-text audits.
  - `src/app/(public)/page.tsx`
- Root layout metadata (meta description, OpenGraph/Twitter defaults, viewport) and animation styles to clear SEO warnings.
  - `src/app/layout.tsx`
  - `src/app/globals.css`
- Bento card layout tweaks for consistent heights and compact presentation.
  - `src/components/ui/bento-grid.tsx`

### Fixed
- Lighthouse “document lacks meta description” and “links do not have descriptive text” issues by providing richer link labels and global meta description.
- Hydration mismatch during scroll animations and introduced smooth scroll-triggered effects without JS runtime penalties.

## [1.3.0] - 2025-10-24

### Added
- Reading indicator on post pages: top progress bar + accessible on‑page navigation (ToC). 
  - `src/components/blog/reading-indicator.tsx`
  - Integrated in `src/app/(public)/blog/[slug]/page.tsx`
- Mobile menu polish: icons for primary links, subtle separators, wider sheet and larger tap targets, preserved a11y (focus management, `aria-current`).
  - `src/components/layout/header-client.tsx`

### Changed
- Registration flow simplified: removed first/last name fields; initial `name` defaults to `username` (editable in profile).
  - `src/components/auth/register-form.tsx`
  - `src/app/(public)/auth/register/page.tsx`
  - `src/actions/signup.ts`

### Fixed
- Better Auth user creation error by aligning Drizzle schema with two‑factor plugin:
  - Added `user.twoFactorEnabled` and `two_factor` table; made `user.name` nullable for social sign‑in edge cases.
  - `auth-schema.ts`
- Type issues where `JSX.Element` namespace was unavailable; migrated to `ReactElement`.
  - `src/components/blog/reading-indicator.tsx`
  - `src/components/layout/header-client.tsx`

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

