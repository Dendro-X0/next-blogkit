"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AuthorInfo {
  readonly id: string;
  readonly name: string | null;
  readonly image: string | null;
}

interface CommentItem {
  readonly id: number;
  readonly content: string;
  readonly rating: number | null;
  readonly createdAt: string;
  readonly author: AuthorInfo | null;
  readonly isOwner: boolean;
}

interface CommentSectionProps {
  readonly postId: number;
}

interface CommentsResponse {
  readonly items: readonly CommentItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

/**
 * Self-hosted comment UI backed by /api/reviews.
 */
export function CommentSection({ postId }: CommentSectionProps): ReactElement {
  const [items, setItems] = useState<readonly CommentItem[]>([]);
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hp, setHp] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const canSubmit = useMemo<boolean>(
    () => content.trim().length > 0 && !submitting,
    [content, submitting],
  );
  const hasMore = useMemo<boolean>(() => items.length < total, [items.length, total]);

  const fetchComments = useCallback(
    async (nextPage: number, append: boolean): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/reviews?postId=${postId}&page=${nextPage}&pageSize=${pageSize}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data: CommentsResponse = await res.json();
        setTotal(data.total);
        setPage(data.page);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } finally {
        setLoading(false);
      }
    },
    [postId, pageSize],
  );

  useEffect(() => {
    void fetchComments(1, false);
  }, [fetchComments]);

  async function submit(): Promise<void> {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: content.trim(), rating, hp }),
      });
      if (res.status === 401) {
        toast.info("Please sign in to comment.");
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error ?? "Failed to submit comment.");
        return;
      }
      setContent("");
      setRating(null);
      setHp("");
      await fetchComments(1, false);
      toast.success("Comment posted");
    } finally {
      setSubmitting(false);
    }
  }

  async function onLoadMore(): Promise<void> {
    if (loading || !hasMore) return;
    await fetchComments(page + 1, true);
  }

  function startEdit(id: number, current: string): void {
    setEditingId(id);
    setEditContent(current);
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditContent("");
  }

  async function saveEdit(id: number): Promise<void> {
    const body: { content?: string } = {};
    if (editContent.trim().length > 0) body.content = editContent.trim();
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      toast.info("Please sign in.");
      return;
    }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(err.error ?? "Failed to update");
      return;
    }
    toast.success("Comment updated");
    cancelEdit();
    await fetchComments(1, false);
  }

  async function deleteItem(id: number): Promise<void> {
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      toast.info("Please sign in.");
      return;
    }
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(err.error ?? "Failed to delete");
      return;
    }
    toast.success("Comment deleted");
    await fetchComments(1, false);
  }

  return (
    <section aria-label="Comments" className="mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                aria-label="Write a comment"
                rows={4}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Optional rating:</span>
                  <StarRating rating={rating ?? 0} onRatingChange={(v) => setRating(v || null)} />
                </div>
                <Button size="sm" disabled={!canSubmit} onClick={submit} aria-label="Post comment">
                  {submitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              {loading && <p className="text-sm text-muted-foreground">Loading comments…</p>}
              {!loading && items.length === 0 && (
                <p className="text-sm text-muted-foreground">Be the first to comment.</p>
              )}
              {items.map((c) => (
                <article key={c.id} className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={c.author?.image ?? undefined}
                      alt={c.author?.name ?? "User avatar"}
                    />
                    <AvatarFallback>{initials(c.author?.name ?? null)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium leading-none">
                        {c.author?.name ?? "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </span>
                      {c.isOwner && editingId !== c.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => startEdit(c.id, c.content)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive"
                            onClick={() => deleteItem(c.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                    {c.rating ? (
                      <div className="mt-1">
                        <StarRating rating={c.rating} readonly />
                      </div>
                    ) : null}
                    {editingId === c.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(c.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{c.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {hasMore && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" disabled={loading} onClick={onLoadMore}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Honeypot field for bots */}
      <input
        type="text"
        className="hidden"
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
      />
    </section>
  );
}
