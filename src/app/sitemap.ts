import { db } from "@/lib/db";
import { type Post, posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { env } from "../../env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

  const postUrls = allPosts.map((post: Post) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.createdAt,
  }));

  return [
    {
      url: `${env.NEXT_PUBLIC_APP_URL}`,
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}
