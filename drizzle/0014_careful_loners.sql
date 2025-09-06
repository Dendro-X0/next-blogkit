CREATE TYPE "public"."reaction_type" AS ENUM('like', 'love', 'insightful', 'curious', 'clap');--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"post_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_reactions_post_id_user_id_type_pk" PRIMARY KEY("post_id","user_id","type")
);
--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;