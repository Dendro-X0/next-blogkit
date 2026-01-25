import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * AccountLayout wraps all /account/* pages with a simple navigation.
 */
export default function AccountLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>
      <nav aria-label="Account sections" className="mb-8 border-b pb-4">
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <Link className="hover:underline" href="/account">
              Dashboard
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/account/comments">
              My Comments
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/account/bookmarks">
              Bookmarks
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/account/subscriptions">
              Subscriptions
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/account/profile">
              Profile
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/account/settings">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  );
}
