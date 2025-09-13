import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getUserRoles } from "@/lib/rbac/queries";
import { headers } from "next/headers";
import { env } from "~/env";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: new Headers(await headers()) });
    if (!session?.user?.id) return NextResponse.json({ roles: [], isAdmin: false });
    const roleSlugs = await getUserRoles(session.user.id);
    const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const email = session.user.email?.toLowerCase();
    const isAllowlisted = !!email && allowlist.length > 0 && allowlist.includes(email);
    const isAdmin = isAllowlisted || roleSlugs.includes("admin");
    return NextResponse.json({ roles: roleSlugs, isAdmin });
  } catch (error) {
    console.error("Error getting my roles:", error);
    return NextResponse.json({ roles: [], isAdmin: false });
  }
}
