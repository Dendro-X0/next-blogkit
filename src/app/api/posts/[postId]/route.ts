import { auth } from "@/lib/auth/auth";
import { cache } from "@/lib/cache/cache";
import { redis } from "@/lib/cache/redis";
import { db } from "@/lib/db";
import { posts, postsToTags, tags } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { getUserRoles } from "@/lib/rbac/queries";

export async function PUT(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const { tags: tagNames, ...postData } = body;

    if (!postId || Number.isNaN(parseInt(postId, 10))) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const postToUpdate = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(postId, 10)),
    });

    if (!postToUpdate) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Authorization: owner OR allowlisted admin OR role-based admin/editor
    const owns = postToUpdate.authorId === session.user.id;
    let allowed = owns;
    if (!allowed) {
      const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const email = session.user.email?.toLowerCase();
      const isAllowlisted = !!email && allowlist.length > 0 && allowlist.includes(email);
      const roleSlugs = await getUserRoles(session.user.id);
      const hasRole = roleSlugs.includes("admin") || roleSlugs.includes("editor");
      allowed = isAllowlisted || hasRole;
    }
    if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const updatedPost = await db.transaction(async (tx) => {
      const updateData: Partial<typeof posts.$inferInsert> = { ...postData };
      updateData.updatedAt = new Date();

      await tx
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, parseInt(postId, 10)));

      if (tagNames && Array.isArray(tagNames)) {
        await tx.delete(postsToTags).where(eq(postsToTags.postId, parseInt(postId, 10)));

        if (tagNames.length > 0) {
          const cleanTagNames = tagNames.filter(
            (t): t is string => typeof t === "string" && t.trim() !== "",
          );

          if (cleanTagNames.length > 0) {
            const existingTags = await tx.query.tags.findMany({
              where: inArray(tags.name, cleanTagNames),
            });

            const existingTagNames = existingTags.map((t) => t.name);
            const newTagNames = cleanTagNames.filter((t) => !existingTagNames.includes(t));

            let newTagIds: { id: number }[] = [];
            if (newTagNames.length > 0) {
              newTagIds = await tx
                .insert(tags)
                .values(newTagNames.map((name) => ({ name })))
                .returning({ id: tags.id });
            }

            const allTagIds = [...existingTags.map((t) => t.id), ...newTagIds.map((t) => t.id)];

            await tx.insert(postsToTags).values(
              allTagIds.map((tagId) => ({
                postId: parseInt(postId, 10),
                tagId: tagId,
              })),
            );
          }
        }
      }

      return tx.query.posts.findFirst({
        where: eq(posts.id, parseInt(postId, 10)),
      });
    });

    // Invalidate cache
    if (redis) {
      await redis.del(`post:${postId}`);
      await redis.del("posts:all:with-drafts");
      await redis.del("posts:all:published-only");
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    if (!postId || Number.isNaN(parseInt(postId, 10))) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const postToDelete = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(postId, 10)),
    });

    if (!postToDelete) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Authorization: owner OR allowlisted admin OR role-based admin/editor
    const owns = postToDelete.authorId === session.user.id;
    let allowed = owns;
    if (!allowed) {
      const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const email = session.user.email?.toLowerCase();
      const isAllowlisted = !!email && allowlist.length > 0 && allowlist.includes(email);
      const roleSlugs = await getUserRoles(session.user.id);
      const hasRole = roleSlugs.includes("admin") || roleSlugs.includes("editor");
      allowed = isAllowlisted || hasRole;
    }
    if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await db.delete(posts).where(eq(posts.id, parseInt(postId, 10)));

    // Invalidate cache
    if (redis) {
      await redis.del(`post:${postId}`);
      await redis.del("posts:all:with-drafts");
      await redis.del("posts:all:published-only");
    }

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;

    if (!postId || Number.isNaN(parseInt(postId, 10))) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const cacheKey = `post:${postId}`;
    const post = await cache(
      { key: cacheKey, ttl: 60 * 5 }, // Cache for 5 minutes
      () =>
        db.query.posts.findFirst({
          where: eq(posts.id, parseInt(postId, 10)),
          with: {
            category: {
              columns: {
                id: true,
                name: true,
              },
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
        }),
    );

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const { postsToTags, ...rest } = post;
    const responseData = {
      ...rest,
      tags: postsToTags.map((pt) => pt.tag.name),
    };

    const res: NextResponse = NextResponse.json(responseData);
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
