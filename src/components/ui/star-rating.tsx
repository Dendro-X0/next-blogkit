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

  return (
    <div className={cn("flex items-center gap-1", className)} onMouseLeave={handleMouseLeave}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={cn(
            "cursor-pointer transition-colors",
            currentRating > index ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
            readonly && "cursor-default",
          )}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
        />
      ))}
    </div>
  );
}
