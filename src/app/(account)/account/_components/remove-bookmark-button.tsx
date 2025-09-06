"use client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import type { ReactElement } from "react";

export function RemoveBookmarkButton({ postId }: { postId: number }): ReactElement {
  const [isPending, startTransition] = useTransition();
  const onRemove = (): void => {
    startTransition(async () => {
      await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      window.location.reload();
    });
  };
  return (
    <Button type="button" variant="outline" size="sm" onClick={onRemove} disabled={isPending}>
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}
