import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { redis } from "@/lib/cache/redis";
import { db } from "@/lib/db";
import { analyticsEvents, comments, posts, user } from "@/lib/db/schema";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { getSessionWithRoles } from "@/lib/auth/session";
import { headers } from "next/headers";
import { env } from "~/env";
import { DashboardStats } from "./_components/dashboard-stats";
import { QuickActions } from "./_components/quick-actions";
import { RecentPosts } from "./_components/recent-posts";
import { SystemStatus } from "./_components/system-status";

type DashboardStatsValues = {
  readonly totalPosts: number;
  readonly totalUsers: number;
  readonly totalComments: number;
  readonly monthlyViews: number;
};

type SystemStatusValues = {
  readonly database: "healthy" | "warning" | "error";
  readonly cache: "optimal" | "warning" | "error";
  readonly storage: { readonly used: number; readonly total: number };
};

type RecentPostItem = {
  id: string;
  slug: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  views: number;
  comments: number;
  publishedAt: string | null;
};

async function getRecentPosts(): Promise<RecentPostItem[]> {
  const RECENT_LIMIT = 5 as const;
  const rows = await db.query.posts.findMany({
    columns: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      published: true,
    },
    with: {
      comments: { columns: { id: true } },
    },
    orderBy: [desc(posts.createdAt)],
    limit: RECENT_LIMIT,
  });

  const items: RecentPostItem[] = [];
  for (const row of rows) {
    const path: string = `/blog/${row.slug}`;
    const viewsCount = await getViewsForPath(path);
    items.push({
      id: row.id.toString(),
      slug: row.slug,
      title: row.title,
      status: row.published ? "published" : "draft",
      views: viewsCount,
      comments: row.comments.length,
      publishedAt: row.published
        ? row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt)
        : null,
    });
  }
  return items;
}

async function getViewsForPath(path: string): Promise<number> {
  const res = await db
    .select({ total: count() })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.name, "page_view"), eq(analyticsEvents.path, path)));
  return Number(res[0]?.total ?? 0);
}

async function getDashboardStats(): Promise<DashboardStatsValues> {
  const [postRow] = await db.select({ total: count() }).from(posts);
  const [userRow] = await db.select({ total: count() }).from(user);
  const [commentRow] = await db.select({ total: count() }).from(comments);

  const thirtyDaysAgo = sql`now() - interval '30 days'`;
  const [viewsRow] = await db
    .select({ total: count() })
    .from(analyticsEvents)
    .where(
      and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, thirtyDaysAgo)),
    );

  return {
    totalPosts: Number(postRow?.total ?? 0),
    totalUsers: Number(userRow?.total ?? 0),
    totalComments: Number(commentRow?.total ?? 0),
    monthlyViews: Number(viewsRow?.total ?? 0),
  };
}

async function getSystemStatus(): Promise<SystemStatusValues> {
  let database: SystemStatusValues["database"] = "healthy";
  try {
    // Lightweight health check
    await db.select({ ok: sql`1` }).from(posts).limit(1);
    database = "healthy";
  } catch {
    database = "error";
  }

  let cache: SystemStatusValues["cache"] = "error";
  if (redis) {
    try {
      const pong: string = await redis.ping();
      cache = pong === "PONG" ? "optimal" : "warning";
    } catch {
      cache = "error";
    }
  } else {
    cache = "warning";
  }

  // Approximate storage usage: number of posts with an image, out of a nominal total
  const [withImageRow] = await db
    .select({ total: count() })
    .from(posts)
    .where(sql`${posts.imageUrl} is not null`);
  const used: number = Number(withImageRow?.total ?? 0);
  const total: number = 100; // nominal capacity for UI; adjust if you add real storage metrics

  return { database, cache, storage: { used: Math.min(used, total), total } };
}

export default async function AdminDashboard(): Promise<ReactElement> {
  const hdrs = new Headers(await headers());
  const { user: me } = await getSessionWithRoles(hdrs);
  const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const email = me?.email?.toLowerCase() ?? null;
  const isAllowlisted = allowlist.length > 0 && !!email && allowlist.includes(email);
  const isAdmin = Boolean(me && me.roles.includes("admin")) || isAllowlisted;
  if (!isAdmin) {
    redirect("/");
  }
  const [recentPosts, stats, status] = await Promise.all([
    getRecentPosts(),
    getDashboardStats(),
    getSystemStatus(),
  ]);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Admin Dashboard" description="Manage your blog content and settings">
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </PageHeader>

        <div className="space-y-8">
          <DashboardStats stats={stats} />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentPosts posts={recentPosts} />
            </div>

            <div className="space-y-6">
              <QuickActions />
              <SystemStatus status={status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
