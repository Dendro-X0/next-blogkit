import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getCmsAdapter } from "@/lib/cms";
import Link from "next/link";
import { type ReactElement } from "react";
import { PostsGrid } from "./_components/posts-grid";

export const revalidate = 300;

async function getBlogData({ page, limit }: { page: number; limit: number }) {
  try {
    const cms = getCmsAdapter();
    const res = await cms.listPosts({ page, limit, includeDrafts: false });
    return {
      items: res.items.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt ?? "No excerpt available.",
        author: post.author?.name ?? "Unknown",
        publishedAt: post.publishedAt ?? post.createdAt,
        readTime: "5 min read",
        tags: post.tags.map((t) => t.name),
        slug: post.slug,
      })),
      hasNext: res.hasNext,
    };
  } catch (error) {
    console.error("[blog] Failed to load posts from database:", error);
    return { items: [], hasNext: false };
  }
}

/**
 * The main Blog page component.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<ReactElement> {
  const sp = await searchParams;
  
  // Safely parse page number, handling potential arrays or invalid strings
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const pageValue = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isNaN(pageValue) ? 1 : Math.max(1, pageValue);
  
  const LIMIT = 10;

  try {
    const { items: pageItems, hasNext } = await getBlogData({ page, limit: LIMIT });

    return (
      <main className="container mx-auto px-4 py-8" aria-labelledby="blog-page-title">
        <div className="max-w-4xl mx-auto">
          <h1 id="blog-page-title" className="sr-only">
            Latest Blog Posts
          </h1>
          <PageHeader
            title="Latest Blog Posts"
            description="Insights, tutorials, and thoughts on modern web development"
          />

          <div className="space-y-8">
            {pageItems.length > 0 ? (
              <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px 900px" }}>
                <PostsGrid posts={pageItems} />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No posts found. Check back later!
              </p>
            )}

            <nav className="flex items-center justify-between pt-8 border-t" aria-label="Pagination">
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={`/blog?page=${page - 1}`} prefetch>
                    Previous
                  </Link>
                </Button>
              ) : (
                <div />
              )}
              <div className="text-sm text-muted-foreground font-medium">
                Page {page}
              </div>
              {hasNext ? (
                <Button asChild variant="outline">
                  <Link href={`/blog?page=${page + 1}`} prefetch>
                    Next
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </nav>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[BlogPage] Critical rendering error:", error);
    // Return a fallback UI instead of crashing the entire page
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an error while loading the blog posts. Please try again later.
        </p>
        <Button asChild>
          <Link href="/blog">Refresh Page</Link>
        </Button>
      </main>
    );
  }
}
