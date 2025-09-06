CREATE TYPE "public"."post_format" AS ENUM('standard', 'video', 'gallery');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "format" "post_format" DEFAULT 'standard' NOT NULL;