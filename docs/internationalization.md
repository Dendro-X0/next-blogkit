# Internationalization (Optional)

The starter includes optional `next-intl` setup under `src/i18n/` and `messages/`.

## Enabling i18n

1. Add your locale messages under `messages/<locale>.json`
2. Configure default and supported locales in the i18n config
3. Wrap pages/components that render translated strings with the appropriate provider

## Translating Content

- UI strings are translated via `next-intl`
- Blog posts can either store localized fields in the database or route by locale (project‑specific)

Keep URLs stable and prefer parameterized routing for locale prefixes when needed.
