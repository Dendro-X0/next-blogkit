import { auth } from "@/lib/auth/auth";
import { cache } from "@/lib/cache/cache";
import { db } from "@/lib/db";
import { posts, postsToTags, tags } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

type DbTransactionCallback = Parameters<typeof db.transaction>[0];
type DbTransaction = Parameters<DbTransactionCallback>[0];

type PostsApiListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  published: boolean;
  authorName: string;
  categoryName: string;
  commentsCount: number;
  tags: string[];
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      slug,
      excerpt,
      imageUrl,
      categoryId,
      published,
      tags: tagNames,
      allowComments,
      seoTitle,
      seoDescription,
      format,
      videoUrl,
      galleryImages,
    } = body;

    if (!title || !content || !slug) {
      return NextResponse.json(
        { message: "Title, content, and slug are required" },
        { status: 400 },
      );
    }

    const authorId = session.user.id;

    const newPost = await db.transaction(async (tx: DbTransaction) => {
      const [createdPost] = await tx
        .insert(posts)
        .values({
          title,
          content,
          slug,
          excerpt,
          imageUrl,
          authorId,
          categoryId,
          published: published || false,
          allowComments,
          seoTitle,
          seoDescription,
          format,
          videoUrl,
          galleryImages,
        })
        .returning();

      if (tagNames && tagNames.length > 0) {
        const existingTags = await tx.select().from(tags).where(inArray(tags.name, tagNames));

        const existingTagNames = existingTags.map((t: { name: string }) => t.name);
        const newTagNames = tagNames.filter((name: string) => !existingTagNames.includes(name));

        let newTags: { id: number; name: string }[] = [];
        if (newTagNames.length > 0) {
          newTags = await tx
            .insert(tags)
            .values(newTagNames.map((name: string) => ({ name })))
            .returning();
        }

        const allTags = [...existingTags, ...newTags];
        await tx.insert(postsToTags).values(
          allTags.map((tag) => ({
            postId: createdPost.id,
            tagId: tag.id,
          })),
        );
      }

      return createdPost;
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get("include_drafts") === "true";
    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;
    const offset = (page - 1) * limit;

    const whereConditions = includeDrafts ? undefined : eq(posts.published, true);

    const cacheKey = `posts:all:${includeDrafts ? "with-drafts" : "published-only"}:p=${page}:l=${limit}`;

    const fetchedPosts = await cache(
      { key: cacheKey, ttl: 60 * 5 }, // Cache for 5 minutes
      () =>
        db.query.posts.findMany({
          where: whereConditions,
          columns: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            createdAt: true,
            updatedAt: true,
            published: true,
          },
          with: {
            author: {
              columns: {
                name: true,
              },
            },
            category: {
              columns: {
                name: true,
              },
            },
            comments: {
              columns: { id: true },
            },
            postsToTags: {
              with: {
                tag: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: [desc(posts.createdAt)],
          limit,
          offset,
        }),
    );

    const responseData: PostsApiListItem[] = fetchedPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      published: post.published,
      authorName: post.author?.name ?? "Unknown",
      categoryName: post.category?.name ?? "Uncategorized",
      commentsCount: post.comments.length,
      tags: post.postsToTags.map((ptt) => ptt.tag.name),
    }));

    const res: NextResponse = NextResponse.json(responseData);
    if (includeDrafts) {
      // Admin views should never be cached by CDNs/browsers
      res.headers.set("Cache-Control", "private, no-store");
    } else {
      // Public list is safe to cache briefly at the edge
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    }
    return res;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
