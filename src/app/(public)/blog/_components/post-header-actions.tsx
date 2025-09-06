"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { PostHeader } from "./post-header";

interface PostHeaderActionsProps {
  readonly post: {
    readonly title: string;
    readonly author: string;
    readonly publishedAt: string;
    readonly readTime: string;
    readonly tags: string[];
  };
  readonly postId: number;
}

/**
 * Client wrapper to bind quick actions (Like/Save) for PostHeader.
 * Emits a custom event so other components (e.g., Reactions) can refresh.
 */
export function PostHeaderActions({ post, postId }: PostHeaderActionsProps): ReactElement {
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/bookmarks?postId=${postId}`);
        if (res.ok) {
          const data: { exists?: boolean } = await res.json();
          if (mounted) setBookmarked(Boolean(data.exists));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId]);

  async function onLike(): Promise<void> {
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, type: "like" }),
    });
    window.dispatchEvent(new Event("reactions:refresh"));
  }

  async function onBookmark(): Promise<void> {
    try {
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch("/api/bookmarks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        setBookmarked((v) => !v);
      }
    } catch {
      // ignore
    }
  }

  return <PostHeader post={post} onLike={onLike} onBookmark={onBookmark} bookmarked={bookmarked} />;
}
