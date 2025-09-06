DO $$
BEGIN
  ALTER TYPE "public"."post_format" ADD VALUE 'audio';
EXCEPTION
  WHEN duplicate_object THEN
    -- enum label already exists, skip
    NULL;
END $$;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "audio_url" text;