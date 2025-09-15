import { env } from "@/../env";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await db.query.user.findFirst({
    where: eq(userSchema.id, session.user.id),
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Prefer value from session if provided by Better Auth twoFactor plugin; default to false otherwise
  type TwoFactorLikeUser = { twoFactorEnabled?: boolean };
  const isTwoFactorEnabled: boolean = Boolean((session.user as TwoFactorLikeUser).twoFactorEnabled);

  const avatarUrl = user.image && env.S3_PUBLIC_URL ? `${env.S3_PUBLIC_URL}/${user.image}` : null;

  // Generate a unique id for aria-labelledby linkage
  const titleId = `settings-title-${session.user.id}`;
  return (
    <main className="container mx-auto px-4 py-8" aria-labelledby={titleId}>
      <div className="max-w-4xl mx-auto">
        <h1 id={titleId} className="sr-only">
          Settings
        </h1>
        <PageHeader title="Settings" description="Manage your account settings and preferences" />
        <SettingsForm user={user} avatarUrl={avatarUrl} isTwoFactorEnabled={isTwoFactorEnabled} />
      </div>
    </main>
  );
}
