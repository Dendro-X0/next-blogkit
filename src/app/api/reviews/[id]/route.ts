import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const idParam = (await context.params).id;
    const id = parseId(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      content?: string;
      rating?: number | null;
    };
    const content = typeof body.content === "string" ? body.content.trim() : undefined;
    const rating = body.rating ?? undefined;

    if (content !== undefined) {
      if (content.length < 2)
        return NextResponse.json({ error: "Comment is too short." }, { status: 400 });
      if (content.length > 4000)
        return NextResponse.json(
          { error: "Comment is too long (max 4000 characters)." },
          { status: 400 },
        );
    }
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5)
        return NextResponse.json({ error: "Invalid rating. Must be 1-5." }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(
        and(
          eq(comments.id, id),
          eq(comments.authorId, session.user.id),
          isNull(comments.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateValues: Partial<typeof comments.$inferInsert> = {};
    if (content !== undefined) updateValues.content = content;
    if (rating !== undefined) updateValues.rating = rating;

    if (Object.keys(updateValues).length === 0)
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    const [updated] = await db
      .update(comments)
      .set(updateValues)
      .where(eq(comments.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const idParam = (await context.params).id;
    const id = parseId(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [existing] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(
        and(
          eq(comments.id, id),
          eq(comments.authorId, session.user.id),
          isNull(comments.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [deleted] = await db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
