ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notification_settings" json;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "security_settings" json;