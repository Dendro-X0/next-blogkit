ALTER TABLE "posts" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "allow_comments" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_title" varchar(70);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_description" varchar(160);