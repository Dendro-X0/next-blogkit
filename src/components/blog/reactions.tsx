"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { Heart, HelpCircle, Lightbulb, Sparkles, ThumbsUp } from "lucide-react";
import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";

type ReactionType = "like" | "love" | "insightful" | "curious" | "clap";

type ReactionCounts = Readonly<Record<ReactionType, number>>;

interface ReactionsProps {
  readonly postId: number;
}

/**
 * Reactions renders reaction buttons with optimistic updates and fetches
 * initial counts plus the current user's selected reaction types.
 */
export function Reactions({ postId }: ReactionsProps): ReactElement {
  const [counts, setCounts] = useState<ReactionCounts>({
    like: 0,
    love: 0,
    insightful: 0,
    curious: 0,
    clap: 0,
  });
  const [userTypes, setUserTypes] = useState<ReadonlySet<ReactionType>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const icons = useMemo(
    () => ({
      like: ThumbsUp,
      love: Heart,
      insightful: Lightbulb,
      curious: HelpCircle,
      clap: Sparkles,
    }),
    [],
  );

  const labels = useMemo(
    () => ({
      like: "Like",
      love: "Love",
      insightful: "Insightful",
      curious: "Curious",
      clap: "Clap",
    }),
    [],
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?postId=${postId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data: { counts: ReactionCounts; userTypes: ReactionType[] } = await res.json();
      setCounts(data.counts);
      setUserTypes(new Set(data.userTypes));
    } catch {
      // ignore
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = () => {
      void fetchData();
    };
    window.addEventListener("reactions:refresh", handler);
    return () => window.removeEventListener("reactions:refresh", handler);
  }, [fetchData]);

  const toggle = async (type: ReactionType) => {
    if (loading) return;
    const nextCounts: Record<ReactionType, number> = { ...counts };
    const nextUser = new Set(userTypes);
    if (nextUser.has(type)) {
      nextUser.delete(type);
      nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
    } else {
      nextUser.add(type);
      nextCounts[type] = (nextCounts[type] ?? 0) + 1;
    }
    setCounts(nextCounts);
    setUserTypes(nextUser);
    setLoading(true);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, type }),
      });
      if (!res.ok) {
        await fetchData();
        return;
      }
      const data: { counts: ReactionCounts; userTypes: ReactionType[] } = await res.json();
      setCounts(data.counts);
      setUserTypes(new Set(data.userTypes));
    } catch {
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const items: ReactionType[] = ["like", "love", "insightful", "curious", "clap"];

  return (
    <div className="flex items-center gap-2">
      {items.map((type) => {
        const Icon = icons[type];
        const isActive = userTypes.has(type);
        const count = counts[type] ?? 0;
        return (
          <Button
            key={type}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={isActive}
            aria-label={labels[type]}
            title={labels[type]}
            className={cn("gap-1", isActive && "text-primary")}
            onClick={() => toggle(type)}
            disabled={loading}
          >
            <Icon className="h-4 w-4" />
            <span className="tabular-nums">{count}</span>
          </Button>
        );
      })}
    </div>
  );
}
