"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewSectionProps {
  postId: string;
}

export function ReviewSection({ postId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/reviews?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsFetching(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!newReviewContent.trim() || newReviewRating === 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: newReviewContent,
          rating: newReviewRating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      setNewReviewContent("");
      setNewReviewRating(0);
      fetchReviews(); // Refresh reviews after submission
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ReviewItem = ({ review }: { review: Review }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.author.image || "/placeholder.svg"} />
              <AvatarFallback>
                {review.author.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{review.author.name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} readonly />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-foreground">{review.content}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground">Reviews ({reviews.length})</h3>

      {/* New Review Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="font-medium">Your Rating</span>
              <StarRating rating={newReviewRating} onRatingChange={setNewReviewRating} />
            </div>
            <Textarea
              placeholder="Share your thoughts..."
              value={newReviewContent}
              onChange={(e) => setNewReviewContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Review"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {isFetching && <p className="text-muted-foreground">Loading reviews...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!isFetching && !error && reviews.length === 0 && (
          <p className="text-muted-foreground">No reviews yet. Be the first to leave one!</p>
        )}
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
