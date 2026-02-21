import { getCmsAdapter } from "@/lib/cms";
import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const cms = getCmsAdapter();
    const entries = await cms.getSitemapEntries();
    const postUrls = entries.map((post) => ({
      url: getAbsoluteUrl(`/blog/${post.slug}`),
      lastModified: post.lastModified,
    }));
    return [{ url: getSiteUrl(), lastModified: new Date() }, ...postUrls];
  } catch (error) {
    console.warn("[sitemap] DB unavailable. Returning minimal sitemap.", error);
    return [{ url: getSiteUrl(), lastModified: new Date() }];
  }
}
