import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import RSS from "rss";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/url";

export async function GET() {
  const feed = new RSS({
    title: "My Blog",
    description: "A blog about web development and other things.",
    feed_url: getAbsoluteUrl("/rss.xml"),
    site_url: getSiteUrl(),
    language: "en",
  });

  try {
    const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
    for (const post of allPosts) {
      feed.item({
        title: post.title,
        description: post.content.substring(0, 250),
        url: getAbsoluteUrl(`/blog/${post.slug}`),
        guid: post.id.toString(),
        date: post.createdAt,
      });
    }
  } catch (error) {
    console.warn("[rss] DB unavailable. Serving empty feed.", error);
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
