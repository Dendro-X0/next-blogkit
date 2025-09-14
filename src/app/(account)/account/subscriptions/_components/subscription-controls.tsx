"use client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import type { ReactElement } from "react";

export function SubscriptionControls({
  email,
  status,
}: {
  email: string;
  status: "subscribed" | "unsubscribed" | "unknown";
}): ReactElement {
  const [isPending, startTransition] = useTransition();

  const onSubscribe = (): void => {
    startTransition(async () => {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      window.location.reload();
    });
  };

  const onUnsubscribe = (): void => {
    startTransition(async () => {
      await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button type="button" onClick={onSubscribe} disabled={isPending || status === "subscribed"}>
        {isPending && status !== "subscribed" ? "Saving..." : "Subscribe"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onUnsubscribe}
        disabled={isPending || status === "unsubscribed"}
      >
        {isPending && status !== "unsubscribed" ? "Saving..." : "Unsubscribe"}
      </Button>
    </div>
  );
}
