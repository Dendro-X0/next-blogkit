# Blog Boilerplate Feature Plan

This document outlines the strategic roadmap for extending the functionality of this boilerplate, inspired by the modular and comprehensive nature of projects like `mksaas-blog-main`.

## Core Principles

- **Modularity**: Features should be self-contained, easy to enable or disable, and organized into distinct modules.
- **Performance**: Prioritize a fast user experience and a lightweight footprint by default.
- **Modern Stack**: Leverage the best of the Next.js and React ecosystem for a cutting-edge developer experience.
- **Developer Experience**: Ensure the codebase is clean, well-documented, and easy for other developers to build upon.

## Feature Roadmap

### Phase 1: Core Functionality (Current State)

- [x] Next.js 15 with App Router
- [x] Drizzle ORM for database interactions
- [x] Better Auth for authentication
- [x] Tailwind CSS v4 for styling
- [x] Light/Dark Mode with `next-themes`
- [x] Basic Blog Features (Posts, Categories, Tags)
- [x] User Profiles and Management

### Phase 2: Essential Blog Features

- **SEO & Content**:
  - [x] Dynamic `sitemap.xml` and `robots.txt` generation.
  - [x] Dynamic RSS/Atom feed generation for blog posts.
  - [x] Structured Data (JSON-LD) for rich snippets in search results.
  - [x] MDX support for writing interactive and component-driven content.
  - [ ] Image optimization and storage solution (e.g., Cloudinary, Vercel Blob).

- **User Engagement**:
  - [ ] Commenting system (e.g., a self-hosted solution or a service like Giscus).
  - [x] Newsletter subscription module with integration for Resend.

### Phase 3: Monetization & Advanced Features

- **Payments**:
  - [ ] Integration with Stripe or Lemon Squeezy for selling digital products or premium content subscriptions.

- **Localization (i18n)**:
  - [ ] Framework for supporting multiple languages using a library like `next-intl`.

- **Analytics**:
  - [ ] Integration with a privacy-focused analytics provider (e.g., Plausible, Fathom) or Google Analytics.

- **Advanced UI/UX**:
  - [ ] Integration of animated and interactive components (e.g., from Magic UI).

### Phase 4: Community & Extras

- **Documentation Site**: 
  - [ ] A dedicated section for project documentation, built with a tool like Nextra.

- **Social Features**:
  - [ ] Enhanced social sharing buttons with view counts.
  - [ ] A system for user-generated content, such as guest posts or a community forum.
