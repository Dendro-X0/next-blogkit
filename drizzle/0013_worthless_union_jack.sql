DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ad_placement' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."ad_placement" AS ENUM('sidebar', 'header', 'in_content', 'footer');
  END IF;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advertisements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"placement" "ad_placement" NOT NULL,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affiliate_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"clicks" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"path" varchar(512) NOT NULL,
	"referrer" varchar(512),
	"user_id" text,
	"session_id" varchar(128),
	"properties" json DEFAULT 'null'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
