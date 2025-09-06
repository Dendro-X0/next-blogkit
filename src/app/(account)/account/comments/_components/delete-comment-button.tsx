"use client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import type { ReactElement } from "react";

export function DeleteCommentButton({ id }: { id: number }): ReactElement {
  const [isPending, startTransition] = useTransition();
  const onDelete = (): void => {
    startTransition(async () => {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      window.location.reload();
    });
  };
  return (
    <Button type="button" variant="outline" size="sm" onClick={onDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
