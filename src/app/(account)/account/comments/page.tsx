import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { comments, posts } from "@/lib/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import type { ReactElement } from "react";
import { DeleteCommentButton } from "./_components/delete-comment-button";
import { getCmsAdapter } from "@/lib/cms";

export default async function AccountCommentsPage(): Promise<ReactElement> {
  const cms = getCmsAdapter();
  if (cms.provider !== "native") {
    return (
      <main>
        <p className="text-muted-foreground">Comments are only available for the native CMS.</p>
      </main>
    );
  }

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return (
      <main>
        <p className="text-muted-foreground">You must be logged in to view your comments.</p>
      </main>
    );
  }

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      postTitle: posts.title,
      postSlug: posts.slug,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .where(and(eq(comments.authorId, session.user.id), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt));

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-6">My Comments</h1>
      <div className="space-y-4">
        {rows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No comments yet.</p>
            </CardContent>
          </Card>
        ) : (
          rows.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">On: {c.postTitle}</CardTitle>
                  <CardDescription>{new Date(c.createdAt).toLocaleString()}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="hover:underline" href={`/blog/${c.postSlug}`}>
                    View Post
                  </Link>
                  <DeleteCommentButton id={c.id} />
                </div>
              </CardHeader>
              <CardContent>
                <p>{c.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
