# File Storage

## Uploads

- Images are uploaded via signed requests to an S3 compatible provider (AWS S3, R2, etc.)
- Server route handlers in `src/app/api/*` and helpers in `src/lib/storage/*` manage signatures and policy

## Serving

- Set `NEXT_PUBLIC_S3_PUBLIC_URL` to your public bucket base URL or CDN alias
- Use that base URL when rendering images in posts/components

## Tips

- Prefer WebP/AVIF when possible
- Keep hero images reasonable (<1MB) and use Cloudinary transformations when applicable
