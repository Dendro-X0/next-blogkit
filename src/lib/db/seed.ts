import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, posts, postsToTags, tags, user, userProfile } from "./schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env or .env.local");
}

const db = drizzle(postgres(process.env.DATABASE_URL!, { max: 1 }));

const main = async () => {
  const mdxContent = `
## Table of Contents

## Welcome to the Future of Content

This post is written in MDX, which allows us to embed interactive React components directly into our markdown.

### Here is a Custom Component

Below is a \`Callout\` component. It's a simple example, but it demonstrates the power of MDX.

<Callout type="info">
  This is an informational callout. You can customize its type and content.
</Callout>

### And Another One

<Callout type="warning">
  This is a warning. Be careful!
</Callout>

MDX opens up a world of possibilities for rich, dynamic content.
`;
  console.log("⏳ Seeding database...");
  const start = Date.now();

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(postsToTags);
  await db.delete(tags);
  await db.delete(posts);
  await db.delete(categories);
  await db.delete(userProfile);
  await db.delete(user);

  // Create a sample user
  const userId = "test-user-id";
  await db.insert(user).values({
    id: userId,
    name: "Test User",
    email: "test@example.com",
    emailVerified: false,
    onboardingComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create a profile for the sample user
  await db.insert(userProfile).values({
    id: userId,
    userId: userId,
    bio: "This is a test bio.",
    location: "Test City, TS",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create a sample category
  console.log("📚 Creating sample category...");
  const [category] = await db
    .insert(categories)
    .values({
      name: "Technology",
      description: "All things tech.",
    })
    .returning();

  // Create a sample post
  console.log("📝 Creating sample post...");
  const [post] = await db
    .insert(posts)
    .values({
      title: "Exploring MDX",
      slug: "exploring-mdx",
      content: mdxContent,
      authorId: userId,
      categoryId: category.id,
      published: true,
      allowComments: true,
      excerpt: "A deep dive into using MDX with Next.js.",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    })
    .returning();

  // Create sample tags
  console.log("🏷️  Creating sample tags...");
  // Create an audio post
  console.log("🎵 Creating sample audio post...");
  const [audioPost] = await db
    .insert(posts)
    .values({
      title: "Podcast Episode 1: The Future of Web Dev",
      slug: "podcast-episode-1",
      content:
        "In this episode, we discuss the latest trends in web development, from serverless architecture to the rise of AI-powered tools.",
      authorId: userId,
      categoryId: category.id,
      published: true,
      allowComments: true,
      format: "audio",
      audioUrl:
        "https://cdn.simplecast.com/audio/cae8b0eb-d3a9-48ba-a859-698b842d35a3/episodes/a925d7c9-4d33-46d4-a6b8-a15e638e5546/audio/128/default.mp3?aid=rss_feed&feed=podcasts.rss",
      excerpt: "Our first podcast episode!",
      imageUrl:
        "https://images.unsplash.com/photo-1590602847834-3a637a4a4e9a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    })
    .returning();

  // Create sample tags
  console.log("🏷️  Creating sample tags...");
  const [tag1, tag2, tag3] = await db
    .insert(tags)
    .values([{ name: "Next.js" }, { name: "MDX" }, { name: "Podcast" }])
    .returning();

  // Associate tags with the post
  console.log("🔗 Linking tags to post...");
  await db.insert(postsToTags).values([
    { postId: post.id, tagId: tag1.id },
    { postId: post.id, tagId: tag2.id },
    { postId: audioPost.id, tagId: tag3.id },
  ]);

  const end = Date.now();
  console.log(`✅ Database seeded successfully in ${end - start}ms`);
  process.exit(0);
};

main().catch((err) => {
  console.error("❌ Error seeding database");
  console.error(err);
  process.exit(1);
});
