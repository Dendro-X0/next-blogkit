import { auth } from "@/lib/auth/auth";
import { cache } from "@/lib/cache/cache";
import { db } from "@/lib/db";
import { analyticsEvents, posts, postsToTags, tags } from "@/lib/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

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

    const newPost = await db.transaction(async (tx) => {
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

        const existingTagNames = existingTags.map((t) => t.name);
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

    const whereConditions = includeDrafts ? undefined : eq(posts.published, true);

    const cacheKey = `posts:all:${includeDrafts ? "with-drafts" : "published-only"}`;

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
        }),
    );

    // Aggregate views per post path in one query to avoid N+1
    const paths = fetchedPosts.map((p) => `/blog/${p.slug}`);
    let viewsByPath = new Map<string, number>();
    if (paths.length > 0) {
      const rows = await db
        .select({ path: analyticsEvents.path, cnt: count().as("cnt") })
        .from(analyticsEvents)
        .where(inArray(analyticsEvents.path, paths))
        .groupBy(analyticsEvents.path);
      viewsByPath = new Map(
        rows.map((r: { path: string; cnt: number | string }) => [r.path, Number(r.cnt)]),
      );
    }

    const responseData = fetchedPosts.map((post) => ({
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
      views: viewsByPath.get(`/blog/${post.slug}`) ?? 0,
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
