import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { type ReactElement, Suspense } from "react";
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

export const revalidate = 60;

// This function fetches and transforms the data directly from the DB
async function getPosts(): Promise<
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
    });

    return rows.map((post) => ({
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
    console.error("Error fetching posts (db):", error);
    return [];
  }
}

export default async function BlogPage(): Promise<ReactElement> {
  const posts = await getPosts();

  return (
    <main
      className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]"
      aria-labelledby="blog-page-title"
    >
      <div className="max-w-4xl mx-auto">
        <h1 id="blog-page-title" className="sr-only">
          Latest Blog Posts
        </h1>
        <PageHeader
          title="Latest Blog Posts"
          description="Insights, tutorials, and thoughts on modern web development"
        />

        <div className="space-y-8">
          <Suspense fallback={<p>Loading posts...</p>}>
            {posts.length > 0 ? (
              <PostsGrid posts={posts} />
            ) : (
              <p>No posts found. Check back later!</p>
            )}
          </Suspense>

          <div className="text-center">
            <Button variant="outline" size="lg" type="button" aria-label="Load more posts">
              Load More Posts
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
