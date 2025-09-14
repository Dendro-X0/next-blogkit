import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { posts, postsToTags, tags as tagsTable } from "@/lib/db/schema";
import { and, desc, eq, inArray, ne } from "drizzle-orm";

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
}

interface RelatedPostsProps {
  currentPostId: string;
  tags: string[];
}

/**
 * Server component: fetches real related posts based on shared tags.
 * Falls back to recent published posts when no tags are provided.
 */
export async function RelatedPosts({ currentPostId, tags }: RelatedPostsProps) {
  const currentIdNum: number = Number(currentPostId);
  const tagFilter: readonly string[] = Array.isArray(tags) ? tags.filter((t) => !!t) : [];

  // Query posts that share any tag with the current post, excluding current, published only.
  // Deduplicate in JS and keep the most recent two.
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      slug: posts.slug,
      createdAt: posts.createdAt,
      tagName: tagsTable.name,
    })
    .from(posts)
    .leftJoin(postsToTags, eq(postsToTags.postId, posts.id))
    .leftJoin(tagsTable, eq(postsToTags.tagId, tagsTable.id))
    .where(
      tagFilter.length > 0
        ? and(
            eq(posts.published, true),
            ne(posts.id, currentIdNum),
            inArray(tagsTable.name, tagFilter),
          )
        : and(eq(posts.published, true), ne(posts.id, currentIdNum)),
    )
    .orderBy(desc(posts.createdAt))
    .limit(20);

  const byId = new Map<number, RelatedPost>();
  for (const r of rows) {
    if (!byId.has(r.id)) {
      byId.set(r.id, {
        id: String(r.id),
        title: r.title,
        excerpt: r.excerpt ?? "",
        slug: r.slug,
        publishedAt: (r.createdAt instanceof Date
          ? r.createdAt
          : new Date(r.createdAt as unknown as string)
        ).toISOString(),
        readTime: "5 min read",
        tags: r.tagName ? [r.tagName] : [],
      });
    } else if (r.tagName) {
      const item = byId.get(r.id)!;
      if (!item.tags.includes(r.tagName)) item.tags.push(r.tagName);
    }
  }

  let relatedPosts: readonly RelatedPost[] = Array.from(byId.values()).slice(0, 2);

  // Fallback to recent posts if no results
  if (relatedPosts.length === 0) {
    const recent = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(and(eq(posts.published, true), ne(posts.id, currentIdNum)))
      .orderBy(desc(posts.createdAt))
      .limit(2);
    relatedPosts = recent.map((r) => ({
      id: String(r.id),
      title: r.title,
      excerpt: r.excerpt ?? "",
      slug: r.slug,
      publishedAt: (r.createdAt instanceof Date
        ? r.createdAt
        : new Date(r.createdAt as unknown as string)
      ).toISOString(),
      readTime: "5 min read",
      tags: [],
    }));
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground">Related Posts</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
