import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Link as LucideLink,
  Megaphone,
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
          <Link href="/admin/affiliate-links">
            <LucideLink className="h-4 w-4 mr-2" />
            Manage Affiliate Links
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            Manage Users & Roles
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/advertisements">
            <Megaphone className="h-4 w-4 mr-2" />
            Manage Advertisements
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Moderate Comments
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
