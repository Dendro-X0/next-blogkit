import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { bookmarks, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import type { ReactElement } from "react";
import { RemoveBookmarkButton } from "../_components/remove-bookmark-button";

/**
 * Lists the current user's bookmarked posts.
 */
export default async function AccountBookmarksPage(): Promise<ReactElement> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return (
      <main>
        <p className="text-muted-foreground">You must be logged in to view bookmarks.</p>
      </main>
    );
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

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-6">Bookmarks</h1>
      <div className="space-y-4">
        {rows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No saved posts yet.</p>
            </CardContent>
          </Card>
        ) : (
          rows.map((b) => (
            <Card key={`${b.postId}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  <Link className="hover:underline" href={`/blog/${b.slug}`}>
                    {b.title}
                  </Link>
                </CardTitle>
                <RemoveBookmarkButton postId={b.postId} />
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
