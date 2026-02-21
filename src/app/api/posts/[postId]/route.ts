import { auth } from "@/lib/auth/auth";
import { cache } from "@/lib/cache/cache";
import { redis } from "@/lib/cache/redis";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { getUserRoles } from "@/lib/rbac/queries";
import { getCmsAdapter } from "@/lib/cms";

function isNativeNumericId(id: string): boolean {
  return /^\d+$/.test(id);
}

async function isAllowedForExternalCms(userId: string, email?: string | null): Promise<boolean> {
  const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const normalizedEmail = email?.toLowerCase();
  const isAllowlisted =
    !!normalizedEmail && allowlist.length > 0 && allowlist.includes(normalizedEmail);
  const roleSlugs = await getUserRoles(userId);
  const hasRole = roleSlugs.includes("admin") || roleSlugs.includes("editor");
  return isAllowlisted || hasRole;
}

export async function PUT(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();

    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const cms = getCmsAdapter();
    const includeDrafts = true;

    if (isNativeNumericId(postId) && cms.provider === "native") {
      const postToUpdate = await db.query.posts.findFirst({
        where: eq(posts.id, Number.parseInt(postId, 10)),
      });
      if (!postToUpdate) return NextResponse.json({ message: "Post not found" }, { status: 404 });

      const owns = postToUpdate.authorId === session.user.id;
      let allowed = owns;
      if (!allowed) {
        allowed = await isAllowedForExternalCms(session.user.id, session.user.email);
      }
      if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    } else {
      const allowed = await isAllowedForExternalCms(session.user.id, session.user.email);
      if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      categoryId,
      published,
      tags: tagNames,
      allowComments,
      seoTitle,
      seoDescription,
      format,
      videoUrl,
      audioUrl,
      galleryImages,
    } = body;

    const updatedPost = await cms.updatePost(postId, {
      title,
      slug,
      excerpt,
      body: content ? { format: cms.provider === "wordpress" ? "html" : cms.provider === "sanity" ? "markdown" : "mdx", value: content } : undefined,
      heroImageUrl: imageUrl,
      categoryId: categoryId !== undefined ? (categoryId ? String(categoryId) : null) : undefined,
      tagNames: Array.isArray(tagNames) ? tagNames : tagNames === undefined ? undefined : [],
      allowComments,
      seoTitle,
      seoDescription,
      status: published === undefined ? undefined : published ? "published" : "draft",
      format,
      videoUrl,
      audioUrl,
      galleryImages,
    });

    if (redis && cms.provider === "native" && isNativeNumericId(postId)) {
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

    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const cms = getCmsAdapter();

    if (isNativeNumericId(postId) && cms.provider === "native") {
      const postToDelete = await db.query.posts.findFirst({
        where: eq(posts.id, Number.parseInt(postId, 10)),
      });
      if (!postToDelete) return NextResponse.json({ message: "Post not found" }, { status: 404 });
      const owns = postToDelete.authorId === session.user.id;
      let allowed = owns;
      if (!allowed) allowed = await isAllowedForExternalCms(session.user.id, session.user.email);
      if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    } else {
      const allowed = await isAllowedForExternalCms(session.user.id, session.user.email);
      if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await cms.deletePost(postId);

    if (redis && cms.provider === "native" && isNativeNumericId(postId)) {
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

    if (!postId) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const cms = getCmsAdapter();
    const cacheKey = `cms:${cms.provider}:post:${postId}`;

    const post = await cache(
      { key: cacheKey, ttl: 60 * 5 },
      () => cms.getPostById(postId, { includeDrafts: true }),
    );

    if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });

    const responseData = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.body.value,
      excerpt: post.excerpt,
      imageUrl: post.heroImageUrl,
      published: post.status === "published",
      allowComments: post.allowComments,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      category: post.category ? { id: post.category.id, name: post.category.name } : null,
      tags: post.tags.map((t) => t.name),
      format: post.format,
      videoUrl: post.videoUrl,
      audioUrl: post.audioUrl,
      galleryImages: post.galleryImages,
    };

    const res: NextResponse = NextResponse.json(responseData);
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
