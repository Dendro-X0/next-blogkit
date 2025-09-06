import type { ReactElement } from "react";
import Link from "next/link";

/**
 * Account dashboard with quick links.
 */
export default async function AccountPage(): Promise<ReactElement> {
  return (
    <main>
      <h1 className="text-2xl font-semibold mb-6">Your Account</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/account/comments" className="block rounded-lg border p-4 hover:bg-accent">
          <div className="font-medium mb-1">My Comments</div>
          <div className="text-sm text-muted-foreground">View comments you have posted.</div>
        </Link>
        <Link href="/account/bookmarks" className="block rounded-lg border p-4 hover:bg-accent">
          <div className="font-medium mb-1">Bookmarks</div>
          <div className="text-sm text-muted-foreground">Posts you saved to read later.</div>
        </Link>
        <Link href="/account/subscriptions" className="block rounded-lg border p-4 hover:bg-accent">
          <div className="font-medium mb-1">Subscriptions</div>
          <div className="text-sm text-muted-foreground">Manage newsletter subscription.</div>
        </Link>
        <Link href="/settings" className="block rounded-lg border p-4 hover:bg-accent">
          <div className="font-medium mb-1">Settings</div>
          <div className="text-sm text-muted-foreground">Security and account preferences.</div>
        </Link>
      </div>
    </main>
  );
}
