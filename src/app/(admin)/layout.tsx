
"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-0 w-full z-50 border-b p-4 flex items-center justify-between bg-background">
                <span className="font-bold">Admin Dashboard</span>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <AdminSidebar />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-muted/10 overflow-y-auto">
                <AdminSidebar className="border-none bg-transparent" />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}
