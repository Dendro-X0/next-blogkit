import { db } from "@/lib/db";
import { type Post, posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    const postUrls = allPosts.map((post: Post) => ({
      url: getAbsoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? post.createdAt,
    }));
    return [{ url: getSiteUrl(), lastModified: new Date() }, ...postUrls];
  } catch (error) {
    console.warn("[sitemap] DB unavailable. Returning minimal sitemap.", error);
    return [{ url: getSiteUrl(), lastModified: new Date() }];
  }
}
