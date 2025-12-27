# Deployment

## Vercel (Recommended)

1. Push your repository to GitHub/GitLab/Bitbucket
2. Import the repo into Vercel
3. Set environment variables from docs/configuration.md
4. Build and deploy

Notes:
- Add the Vercel Analytics and Speed Insights integrations if you want those features.
- If you use SMTP + MailHog, disable those in production and switch to Resend.

## Other Platforms

- Any Node platform that supports Next.js 16 should work.
- Ensure environment variables and Postgres are available.

## Static Assets & Images

- Images uploaded to S3 are served via the `NEXT_PUBLIC_S3_PUBLIC_URL`. Consider a CDN in front of your bucket.
- For Cloudinary optimization, configure credentials on Cloudinary side and use the `next-cloudinary` components where provided.
