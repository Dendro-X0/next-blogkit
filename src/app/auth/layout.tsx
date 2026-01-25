import type React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BlogKit. All rights reserved.
      </div>
    </div>
  );
}
