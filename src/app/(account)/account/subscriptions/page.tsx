import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { getNewsletterStatus } from "@/lib/newsletter";
import { headers } from "next/headers";
import type { ReactElement } from "react";
import { SubscriptionControls } from "./_components/subscription-controls";

export default async function AccountSubscriptionsPage(): Promise<ReactElement> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const email: string | undefined = session?.user?.email ?? undefined;

  if (!email) {
    return (
      <main>
        <p className="text-muted-foreground">You must be logged in to manage subscriptions.</p>
      </main>
    );
  }

  const status = await getNewsletterStatus(email);

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-6">Subscriptions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
          <CardDescription>
            Current status for <span className="font-medium">{email}</span>: {status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionControls email={email} status={status} />
        </CardContent>
      </Card>
    </main>
  );
}
