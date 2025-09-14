import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, user, userRoles } from "@/lib/db/schema";
import { asc, eq, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { env } from "~/env";
import { getUserRoles } from "@/lib/rbac/queries";

type UserListItem = Readonly<{
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: readonly string[];
}>;

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
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

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 100);

    const where = q ? or(ilike(user.name, `%${q}%`), ilike(user.email, `%${q}%`)) : undefined;

    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        roleSlug: roles.slug,
      })
      .from(user)
      .leftJoin(userRoles, eq(userRoles.userId, user.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(where)
      .orderBy(asc(user.email))
      .limit(limit);

    const map = new Map<string, UserListItem>();
    for (const r of rows) {
      const key = r.id;
      if (!map.has(key)) {
        map.set(key, {
          id: r.id,
          name: r.name,
          email: r.email,
          image: r.image,
          roles: r.roleSlug ? [r.roleSlug] : [],
        });
      } else if (r.roleSlug) {
        const item = map.get(key)!;
        if (!item.roles.includes(r.roleSlug)) {
          (item.roles as string[]).push(r.roleSlug);
        }
      }
    }

    const items = Array.from(map.values());
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
