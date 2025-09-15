"use client";

import { cn } from "@/lib/utils/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
  size?: number;
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  className,
  size = 20,
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleStarClick = (index: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(index + 1);
  };

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(null);
  };

  const currentRating = hoverRating ?? rating;

  const values: ReadonlyArray<number> = [1, 2, 3, 4, 5] as const;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={handleMouseLeave}
      role="radiogroup"
      aria-readonly={readonly}
      aria-label="Rating"
    >
      {values.map((value) => {
        const checked: boolean = currentRating >= value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
            disabled={readonly}
            onClick={() => handleStarClick(value - 1)}
            onMouseEnter={() => handleMouseEnter(value - 1)}
            className="p-0 bg-transparent border-0"
          >
            <Star
              size={size}
              className={cn(
                "cursor-pointer transition-colors",
                checked ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
                readonly && "cursor-default",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
