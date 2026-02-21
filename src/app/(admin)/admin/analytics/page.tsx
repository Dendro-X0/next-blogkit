
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { comments, posts, user, categories } from "@/lib/db/schema";
import { count, desc, sql, eq } from "drizzle-orm";
import { type ReactElement } from "react";
import { getSessionWithRoles } from "@/lib/auth/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "~/env";
import { BarChart3, Users, FileText, MessageSquare, TrendingUp, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCmsAdapter } from "@/lib/cms";

export default async function AdminAnalyticsPage(): Promise<ReactElement> {
    const hdrs = await headers();
    const { user: me } = await getSessionWithRoles(hdrs);

    const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    const email = me?.email?.toLowerCase() ?? null;
    const isAllowlisted = allowlist.length > 0 && !!email && allowlist.includes(email);
    const isAdmin = Boolean(me?.roles?.includes("admin")) || isAllowlisted;

    if (!isAdmin) {
        redirect("/");
    }

    const cms = getCmsAdapter();

    // Fetch Stats
    const [
        totalUsersRow,
        totalCommentsRow,
    ] = await Promise.all([
        db.select({ count: count() }).from(user),
        db.select({ count: count() }).from(comments),
    ]);

    const totalUsers = totalUsersRow[0].count;
    const totalComments = totalCommentsRow[0].count;

    const totalCategories =
        cms.provider === "native"
            ? (await db.select({ count: count() }).from(categories))[0].count
            : (await cms.listCategories()).length;

    const totalPosts =
        cms.provider === "native" ? (await db.select({ count: count() }).from(posts))[0].count : 0;

    const topPosts =
        cms.provider === "native"
            ? await db
                .select({
                    id: posts.id,
                    title: posts.title,
                    commentCount: count(comments.id),
                })
                .from(posts)
                .leftJoin(comments, eq(posts.id, comments.postId))
                .groupBy(posts.id)
                .orderBy(desc(count(comments.id)))
                .limit(5)
            : [];

    const topAuthors =
        cms.provider === "native"
            ? await db
                .select({
                    id: user.id,
                    name: user.name,
                    postCount: count(posts.id),
                })
                .from(user)
                .leftJoin(posts, eq(user.id, posts.authorId))
                .groupBy(user.id)
                .orderBy(desc(count(posts.id)))
                .limit(5)
            : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <PageHeader
                    title="Analytics"
                    description="Insights into your blog's performance and engagement"
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPosts}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-emerald-500 inline-flex items-center">
                                    Live
                                </span>{" "}
                                content items
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Community</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Registered members</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalComments}</div>
                            <p className="text-xs text-muted-foreground">Total user comments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxonomy</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCategories}</div>
                            <p className="text-xs text-muted-foreground">Active categories</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 md:grid-cols-2 mt-8">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Top Engagement</CardTitle>
                            <CardDescription>Posts with the most comments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topPosts.map((post, i) => (
                                    <div key={post.id} className="flex items-center gap-4">
                                        <div className="w-8 text-sm font-bold text-muted-foreground">#{i + 1}</div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none truncate w-[200px]">{post.title}</p>
                                        </div>
                                        <Badge variant="secondary">{post.commentCount} comments</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Top Authors</CardTitle>
                            <CardDescription>Most active content creators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topAuthors.map((author, i) => (
                                    <div key={author.id} className="flex items-center gap-4">
                                        <div className="w-8 text-sm font-bold text-muted-foreground">#{i + 1}</div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{author.name || "Unknown Author"}</p>
                                        </div>
                                        <Badge variant="outline">{author.postCount} posts</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-8 bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                External Analytics Integrated
                            </CardTitle>
                            <CardDescription>
                                Deep traffic analysis, visitor behavior, and speed insights are managed via Vercel Analytics.
                            </CardDescription>
                        </div>
                        <Badge variant="default" className="h-fit">Active</Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your project is configured to send Real User Monitoring (RUM) data directly to Vercel for high-precision tracking without slowing down your site.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://vercel.com/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium flex items-center gap-1 text-primary hover:underline"
                            >
                                Go to Vercel Analytics
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
