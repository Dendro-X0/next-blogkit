import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { bookmarks, posts } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";

interface JsonBody {
  readonly postId?: number;
}

/**
 * GET /api/bookmarks
 * - If ?postId is provided: returns { exists: boolean }
 * - Otherwise: returns current user's bookmarks with basic post data
 */
export async function GET(request: Request) {
  const url: URL = new URL(request.url);
  const postIdParam: string | null = url.searchParams.get("postId");
  const headers: Headers = new Headers();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (postIdParam) {
    const postId: number = Number(postIdParam);
    if (!Number.isFinite(postId)) {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }
    const existing = await db
      .select({ postId: bookmarks.postId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, session.user.id), eq(bookmarks.postId, postId)))
      .limit(1);
    return NextResponse.json({ exists: existing.length > 0 });
  }

  const rows = await db
    .select({
      postId: bookmarks.postId,
      createdAt: bookmarks.createdAt,
      title: posts.title,
      slug: posts.slug,
    })
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .where(eq(bookmarks.userId, session.user.id))
    .orderBy(desc(bookmarks.createdAt));

  return NextResponse.json({ items: rows });
}

/**
 * POST /api/bookmarks
 * Adds a bookmark for the current user.
 */
export async function POST(request: Request) {
  const headers: Headers = new Headers();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as JsonBody;
  const postId: number | undefined = body.postId;
  if (!Number.isFinite(postId)) return NextResponse.json({ error: "Invalid postId" }, { status: 400 });

  const exists = await db
    .select({ postId: bookmarks.postId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, session.user.id), eq(bookmarks.postId, postId!)))
    .limit(1);
  if (exists.length > 0) {
    return NextResponse.json({ added: false });
  }
  await db.insert(bookmarks).values({ userId: session.user.id, postId: postId! });
  return NextResponse.json({ added: true }, { status: 201 });
}

/**
 * DELETE /api/bookmarks
 * Removes a bookmark for the current user.
 */
export async function DELETE(request: Request) {
  const headers: Headers = new Headers();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as JsonBody;
  const postId: number | undefined = body.postId;
  if (!Number.isFinite(postId)) return NextResponse.json({ error: "Invalid postId" }, { status: 400 });

  const res = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, session.user.id), eq(bookmarks.postId, postId!)))
    .returning({ postId: bookmarks.postId });

  return NextResponse.json({ removed: res.length > 0 });
}
