CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"location" text,
	"website" text
);
--> statement-breakpoint
ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "two_factor_secret";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_two_factor_enabled";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "notification_settings";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "security_settings";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");