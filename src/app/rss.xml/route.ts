import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import RSS from "rss";
import { env } from "~/env";

export async function GET() {
  const feed = new RSS({
    title: "My Blog",
    description: "A blog about web development and other things.",
    feed_url: `${env.NEXT_PUBLIC_APP_URL}/rss.xml`,
    site_url: env.NEXT_PUBLIC_APP_URL,
    language: "en",
  });

  const allPosts = await db.select().from(posts).orderBy(posts.createdAt);

  allPosts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.content.substring(0, 250), // Or a summary field if you have one
      url: `${env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
      guid: post.id.toString(),
      date: post.createdAt,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
