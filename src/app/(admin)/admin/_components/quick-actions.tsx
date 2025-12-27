import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/posts">
            <FileText className="h-4 w-4 mr-2" />
            Manage Posts
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            Manage Users & Roles
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Moderate Comments
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
