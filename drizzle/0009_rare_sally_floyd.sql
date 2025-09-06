ALTER TABLE "comments" ADD COLUMN "rating" integer;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;