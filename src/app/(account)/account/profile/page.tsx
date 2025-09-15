import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlMessageToaster } from "@/components/ui/url-message-toaster";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { type Comment, type Post, user as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Bookmark, Calendar, Edit, Mail, MapPin } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

type CommentWithPostTitle = Comment & { post: { title: string } };

export default async function ProfilePage(): Promise<ReactElement> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userData = await db.query.user.findFirst({
    where: eq(userSchema.id, session.user.id),
    with: {
      profile: true,
      posts: true,
      comments: {
        with: {
          post: {
            columns: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!userData) {
    redirect("/auth/login");
  }

  const userPosts = userData.posts;
  const userComments = userData.comments;

  const titleId = `profile-title-${session.user.id}`;
  return (
    <main className="container mx-auto px-4 py-8" aria-labelledby={titleId}>
      <UrlMessageToaster />
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 mx-auto md:mx-0">
                <AvatarImage
                  src={userData.image || "/placeholder.svg"}
                  alt={userData.name || "User Avatar"}
                />
                <AvatarFallback className="text-2xl">
                  {userData.name
                    ? userData.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 id={titleId} className="text-3xl font-bold">
                    {userData.name || "New User"}
                  </h1>
                  <Link href="/account/settings">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>

                <p className="text-muted-foreground mb-4">
                  {userData.profile?.bio || "No bio provided."}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                  {userData.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {userData.email}
                    </div>
                  )}
                  {userData.profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {userData.profile.location}
                    </div>
                  )}
                  {userData.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(userData.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{userPosts.length}</div>
              <p className="text-sm text-muted-foreground">Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{userComments.length}</div>
              <p className="text-sm text-muted-foreground">Comments</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" aria-label="Profile sections">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post: Post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>
                      Published on {new Date(post.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No posts yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {userComments.length > 0 ? (
              userComments.map((comment: CommentWithPostTitle) => (
                <Card key={comment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">On: {comment.post.title}</CardTitle>
                    <CardDescription>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No comments yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved posts yet</h3>
                <p className="text-muted-foreground">
                  Posts you bookmark will appear here for easy access later.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
