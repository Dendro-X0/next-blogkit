import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { env } from "~/env";
import { and, eq, isNull } from "drizzle-orm";
import { getUserRoles } from "@/lib/rbac/queries";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const idParam = (await context.params).id;
    const id = parseId(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const session = await auth.api.getSession({ headers: new Headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (allowlist.length > 0) {
      const email = session.user.email?.toLowerCase();
      if (!email || !allowlist.includes(email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      const roles = await getUserRoles(session.user.id);
      const ok = roles.includes("admin") || roles.includes("editor") || roles.includes("moderator");
      if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action } = (await request.json().catch(() => ({}))) as { action?: string };
    const nextStatus: "approved" | "rejected" | null =
      action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
    if (!nextStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [updated] = await db
      .update(reviews)
      .set({ status: nextStatus })
      .where(eq(reviews.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error moderating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
