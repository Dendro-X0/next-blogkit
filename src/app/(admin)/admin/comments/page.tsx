
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { comments, posts, user } from "@/lib/db/schema";
import { desc, eq, isNull } from "drizzle-orm";
import { type ReactElement } from "react";
import { CommentsTable } from "../_components/comments-table";
import { getSessionWithRoles } from "@/lib/auth/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "~/env";
import { getCmsAdapter } from "@/lib/cms";

export default async function AdminCommentsPage(): Promise<ReactElement> {
    const hdrs = await headers();
    const { user: me } = await getSessionWithRoles(hdrs);

    const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    const email = me?.email?.toLowerCase() ?? null;
    const isAllowlisted = allowlist.length > 0 && !!email && allowlist.includes(email);
    const isAdmin = Boolean(me?.roles?.includes("admin")) || isAllowlisted;

    if (!isAdmin) {
        redirect("/");
    }

    const cms = getCmsAdapter();
    if (cms.provider !== "native") {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <PageHeader
                        title="Comments"
                        description="Comments are only available for the native CMS provider"
                    />
                </div>
            </div>
        );
    }

    const rows = await db
        .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            authorName: user.name,
            authorEmail: user.email,
            postTitle: posts.title,
            postSlug: posts.slug,
        })
        .from(comments)
        .innerJoin(posts, eq(comments.postId, posts.id))
        .innerJoin(user, eq(comments.authorId, user.id))
        .where(isNull(comments.deletedAt))
        .orderBy(desc(comments.createdAt));

    const formattedComments = rows.map((r) => ({
        id: r.id,
        content: r.content,
        authorName: r.authorName ?? "Anonymous",
        authorEmail: r.authorEmail,
        postTitle: r.postTitle,
        postSlug: r.postSlug,
        createdAt: r.createdAt.toISOString(),
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <PageHeader
                    title="Comments"
                    description="Manage and moderate user comments across all posts"
                />
                <div className="mt-8">
                    <CommentsTable comments={formattedComments} />
                </div>
            </div>
        </div>
    );
}
