import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { env } from "~/env";
import { getUserRoles } from "@/lib/rbac/queries";

export async function GET(): Promise<NextResponse> {
  try {
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
      const roleSlugs = await getUserRoles(session.user.id);
      if (!roleSlugs.includes("admin"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await db.select().from(roles).orderBy(asc(roles.slug));
    const items = rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name }));
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error listing roles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
