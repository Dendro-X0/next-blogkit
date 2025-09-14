import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, userRoles, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { env } from "~/env";
import { getUserRoles } from "@/lib/rbac/queries";

function parseId(raw: string): string | null {
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const idParam = (await context.params).id;
    const targetUserId = parseId(idParam);
    if (!targetUserId) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

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
      const rolesArr = await getUserRoles(session.user.id);
      if (!rolesArr.includes("admin"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { role?: string };
    const roleSlug = typeof body.role === "string" ? body.role.trim() : "";
    if (!roleSlug) return NextResponse.json({ error: "role is required" }, { status: 400 });

    const [targetUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [roleRow] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.slug, roleSlug))
      .limit(1);
    if (!roleRow) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    // Upsert assignment (avoid duplicate by composite PK)
    await db
      .insert(userRoles)
      .values({ userId: targetUserId, roleId: roleRow.id })
      .onConflictDoNothing();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const idParam = (await context.params).id;
    const targetUserId = parseId(idParam);
    if (!targetUserId) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

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
      const rolesArr = await getUserRoles(session.user.id);
      if (!rolesArr.includes("admin"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { role?: string };
    const roleSlug = typeof body.role === "string" ? body.role.trim() : "";
    if (!roleSlug) return NextResponse.json({ error: "role is required" }, { status: 400 });

    const [roleRow] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.slug, roleSlug))
      .limit(1);
    if (!roleRow) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleRow.id)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error removing role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
