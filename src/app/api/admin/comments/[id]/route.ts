
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { env } from "~/env";
import { getUserRoles } from "@/lib/rbac/queries";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const commentId = Number(id);

        if (isNaN(commentId)) {
            return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
        }

        const headers = new Headers(request.headers);
        const session = await auth.api.getSession({ headers });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        const email = session.user.email?.toLowerCase();
        const isAllowlisted = email && allowlist.includes(email);

        const roles = await getUserRoles(session.user.id);
        const isAdmin = roles.includes("admin") || isAllowlisted;

        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Perform soft delete (if deletedAt exists) or hard delete
        // The schema has deletedAt, so let's do soft delete
        await db
            .update(comments)
            .set({ deletedAt: new Date() })
            .where(eq(comments.id, commentId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
