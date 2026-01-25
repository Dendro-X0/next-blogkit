
import { Button } from "@/components/ui/button";
import {
    BarChart,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { BlogKitLogo } from "@/components/layout/blogkit-logo";

interface AdminSidebarProps {
    className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname();

    const links = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/admin",
        },
        {
            href: "/admin/analytics",
            label: "Analytics",
            icon: BarChart,
            active: pathname === "/admin/analytics",
        },
        {
            href: "/admin/posts",
            label: "Posts",
            icon: FileText,
            active: pathname.startsWith("/admin/posts"),
        },
        {
            href: "/admin/comments",
            label: "Comments",
            icon: MessageSquare,
            active: pathname.startsWith("/admin/comments"),
        },
        {
            href: "/admin/users",
            label: "Users & Roles",
            icon: Users,
            active: pathname.startsWith("/admin/users"),
        },
    ];

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-muted/10", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2 px-4 mb-8">
                        <BlogKitLogo size={24} />
                        <span className="text-lg font-bold tracking-tight">BlogKit Admin</span>
                    </div>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <Button
                                key={link.href}
                                variant={link.active ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={link.href}>
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                        System
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                View Site
                            </Link>
                        </Button>
                        {/* 
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
             */}
                    </div>
                </div>
            </div>
        </div>
    );
}
