import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { type ReactElement } from "react";
import { PostsGrid } from "./_components/posts-grid";

// Define the shape of the data we expect from our API
type DbPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: Date;
  author?: { name: string | null } | null;
  postsToTags: { tag: { name: string } }[];
};

export const revalidate = 300;

// This function fetches and transforms the data directly from the DB
async function getPosts({ page, limit }: { page: number; limit: number }): Promise<
  {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    publishedAt: string;
    readTime: string;
    tags: string[];
    slug: string;
  }[]
> {
  try {
    const rows: DbPost[] = await db.query.posts.findMany({
      where: eq(posts.published, true),
      columns: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
      },
      with: {
        author: { columns: { name: true } },
        postsToTags: { with: { tag: { columns: { name: true } } } },
      },
      orderBy: [desc(posts.createdAt)],
      limit: limit + 1, // fetch one extra to determine if next page exists
      offset: (page - 1) * limit,
    });
    const sliced: DbPost[] = rows.slice(0, limit);
    return sliced.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      excerpt: post.excerpt ?? "No excerpt available.",
      author: post.author?.name ?? "Unknown",
      publishedAt:
        post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
      readTime: "5 min read",
      tags: post.postsToTags.map((ptt) => ptt.tag.name),
      slug: post.slug,
    }));
  } catch (error) {
    console.error("[blog] Failed to load posts:", error);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<ReactElement> {
  const sp = await searchParams;
  const page: number = Math.max(1, Number(sp.page ?? 1));
  const LIMIT = 10;
  const rows = await db.query.posts.findMany({
    where: eq(posts.published, true),
    columns: { id: true },
    orderBy: [desc(posts.createdAt)],
    limit: LIMIT + 1,
    offset: (page - 1) * LIMIT,
  });
  const hasNext: boolean = rows.length > LIMIT;
  const pageItems = await getPosts({ page, limit: LIMIT });

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
            <p>No posts found. Check back later!</p>
          )}

          <nav className="flex items-center justify-between">
            {page > 1 ? (
              <Button asChild variant="outline">
                <Link href={`/blog?page=${page - 1}`}>Previous</Link>
              </Button>
            ) : (
              <span />
            )}
            {hasNext && (
              <Button asChild variant="outline">
                <Link href={`/blog?page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </main>
  );
}
