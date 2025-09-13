# File Storage

## Cloudinary (default)

By default, uploads go to Cloudinary using a simple route handler.

- Route: `src/app/api/upload/route.ts`
- Required env vars:
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Client sends a `multipart/form-data` request with a `file` field to `/api/upload`.

### Serving

- Use Cloudinary delivery URLs (e.g., `https://res.cloudinary.com/<cloud_name>/...`) in components/MDX.
- You can apply on-the-fly transformations via URL parameters for optimization.

## S3 (optional provider)

An S3-compatible storage provider is implemented but not wired by default.

- Provider: `src/lib/storage/s3.ts` via `S3Provider`
- Interface: `src/lib/storage/types.ts`
- Configuration: `env.ts` includes optional S3 keys
- Required env vars if you enable S3:
  - `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
  - `S3_ENDPOINT?` for S3-compatible services (R2/MinIO)
  - `NEXT_PUBLIC_S3_PUBLIC_URL` for serving

To switch to S3 uploads, create a route that uses `S3Provider.getPresignedUploadUrl()` and upload directly from the client using the returned signed URL. Keep your public URLs consistent by serving via `NEXT_PUBLIC_S3_PUBLIC_URL` or a CDN.

## Tips

- Prefer modern formats (WebP/AVIF) when possible
- Keep hero images reasonable (<1MB)
- Use Cloudinary transformations or CDN optimizations to reduce payloads
