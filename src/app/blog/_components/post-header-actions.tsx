"use client";

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
  async function onLike(): Promise<void> {
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, type: "like" }),
    });
    window.dispatchEvent(new Event("reactions:refresh"));
  }

  function onBookmark(): void {}

  return <PostHeader post={post} onLike={onLike} onBookmark={onBookmark} />;
}
