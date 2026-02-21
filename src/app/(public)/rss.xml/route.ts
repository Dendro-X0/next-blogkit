import { getCmsAdapter } from "@/lib/cms";
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
    const cms = getCmsAdapter();
    const allPosts = await cms.getRssEntries();
    for (const post of allPosts) {
      feed.item({
        title: post.title,
        description: post.description,
        url: getAbsoluteUrl(`/blog/${post.slug}`),
        guid: post.id.toString(),
        date: post.date,
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
