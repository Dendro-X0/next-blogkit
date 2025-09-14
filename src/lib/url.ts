/**
 * Resolve the site base URL for use in metadata, RSS, and sitemaps.
 * Priority:
 * 1) NEXT_PUBLIC_APP_URL (if set)
 * 2) VERCEL_URL from runtime (https://<vercel-url>)
 * 3) Fallback to http://localhost:3000
 */
export function getSiteUrl(): string {
  const fromEnv: string | undefined = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, "");
  }
  const vercelUrl: string | undefined = process.env.VERCEL_URL;
  if (vercelUrl && typeof vercelUrl === "string" && vercelUrl.trim().length > 0) {
    const full = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return full.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Join the site base URL with a path, ensuring exactly one slash.
 */
export function getAbsoluteUrl(path: string): string {
  const base: string = getSiteUrl();
  const normalizedPath: string = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
