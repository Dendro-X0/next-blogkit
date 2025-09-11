# Mobile & Accessibility (A11y)

This project uses shadcn/ui and Tailwind v4 which provide strong accessible defaults. Follow these conventions to keep pages usable and inclusive.

## Landmarks & Navigation

- Ensure each page exposes a primary `<main id="main-content" tabIndex={-1}>` target for the skip link
- Wrap groups of links/buttons in a `<nav aria-label="...">` when they form a navigation cluster

## Forms

- Use the form primitives to connect `<Label>`, `<Input>`, and error helpers
- Add `autoComplete`/`inputMode` (email, username, new-password, current-password, one-time-code, numeric)
- Announce results with live regions (success: `role="status"`, error: `role="alert"`)

## Focus & Motion

- Keep `:focus-visible` rings prominent; avoid removing outlines
- Respect `prefers-reduced-motion` for large animations

## Content

- Provide alt text for images
- Use headings in order (h1 → h2 → h3)
- Ensure sufficient color contrast in both light and dark themes
