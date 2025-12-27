CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_comments" boolean DEFAULT true NOT NULL,
	"email_likes" boolean DEFAULT true NOT NULL,
	"email_follows" boolean DEFAULT true NOT NULL,
	"email_newsletter" boolean DEFAULT true NOT NULL,
	"push_comments" boolean DEFAULT false NOT NULL,
	"push_likes" boolean DEFAULT false NOT NULL,
	"push_follows" boolean DEFAULT false NOT NULL,
	"push_new_posts" boolean DEFAULT false NOT NULL,
	"login_alerts" boolean DEFAULT true NOT NULL,
	"session_timeout_minutes" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_posts_published_created_at" ON "posts" USING btree ("published","created_at");--> statement-breakpoint
CREATE INDEX "idx_posts_to_tags_tag_id" ON "posts_to_tags" USING btree ("tag_id");