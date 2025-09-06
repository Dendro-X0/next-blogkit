-- Bookmarks table for user-saved posts
CREATE TABLE IF NOT EXISTS "bookmarks" (
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "bookmarks_pk" PRIMARY KEY ("user_id", "post_id")
);
