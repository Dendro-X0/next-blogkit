import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { account, session, user, userProfile } from "../../../auth-schema";

// Re-export auth tables to be used by other files
export * from "../../../auth-schema";

// --- BLOG TABLES ---

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).unique().notNull(),
  description: text("description"),
});

export const postFormatEnum = pgEnum("post_format", ["standard", "video", "gallery", "audio"]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  imageUrl: text("image_url"),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  format: postFormatEnum("format").default("standard").notNull(),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  galleryImages: json("gallery_images").$type<string[]>(),
  authorId: text("author_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  published: boolean("published").default(false).notNull(),
  allowComments: boolean("allow_comments").default(true).notNull(),
  seoTitle: varchar("seo_title", { length: 70 }),
  seoDescription: varchar("seo_description", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).unique().notNull(),
});

export const postsToTags = pgTable(
  "posts_to_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  }),
);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  rating: integer("rating"), // Should be between 1 and 5. Validated at the application level.
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// --- REACTIONS ---
// Users can react to posts with a small fixed set of types.
export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "love",
  "insightful",
  "curious",
  "clap",
]);

export const postReactions = pgTable(
  "post_reactions",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: reactionTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    // Enforce one reaction of each type per user per post
    pk: primaryKey({ columns: [t.postId, t.userId, t.type] }),
  }),
);

export type PostReaction = typeof postReactions.$inferSelect;
export type NewPostReaction = typeof postReactions.$inferInsert;

// --- MONETIZATION TABLES ---

export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  description: text("description"),
  clicks: integer("clicks").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type NewAffiliateLink = typeof affiliateLinks.$inferInsert;

export const adPlacementEnum = pgEnum("ad_placement", [
  "sidebar",
  "header",
  "in_content",
  "footer",
]);

export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  placement: adPlacementEnum("placement").notNull(),
  content: text("content").notNull(), // Can be HTML, image URL, etc.
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Advertisement = typeof advertisements.$inferSelect;
export type NewAdvertisement = typeof advertisements.$inferInsert;

// --- RELATIONS ---
export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.id],
  }),
  posts: many(posts),
  comments: many(comments),
  postReactions: many(postReactions),
  accounts: many(account),
  sessions: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  postsToTags: many(postsToTags),
  postReactions: many(postReactions),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}));

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsToTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(user, {
    fields: [comments.authorId],
    references: [user.id],
  }),
}));

// --- ANALYTICS TABLES ---
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  path: varchar("path", { length: 512 }).notNull(),
  referrer: varchar("referrer", { length: 512 }),
  userId: text("user_id"),
  sessionId: varchar("session_id", { length: 128 }),
  properties: json("properties").$type<Record<string, unknown> | null>().default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AnalyticsEventRow = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEventRow = typeof analyticsEvents.$inferInsert;
