import { auth } from "@/lib/auth/auth";
import { getUserRoles } from "@/lib/rbac/queries";
import { headers as nextHeaders } from "next/headers";
import { env } from "~/env";

export type SessionWithRoles = Readonly<{
  user: Readonly<{
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    roles: readonly string[];
  }> | null;
}>;

/**
 * Fetches the Better Auth session and augments it with user roles.
 * This avoids repeated role lookups across the app.
 */
export async function getSessionWithRoles(h?: Headers): Promise<SessionWithRoles> {
  // bypass for demo/recording
  if (env.DISABLE_AUTH_GUARD) {
    return {
      user: {
        id: "demo-admin-id",
        email: "demo@example.com",
        name: "Demo Admin",
        image: null,
        roles: ["admin"],
      },
    } as const;
  }

  let hdrs: Headers;
  if (h) {
    hdrs = h;
  } else {
    try {
      hdrs = await nextHeaders();
    } catch {
      // Fallback prevents runtime errors, but session may be null without cookies
      hdrs = new Headers();
    }
  }
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session?.user?.id) return { user: null } as const;
  const roles = await getUserRoles(session.user.id);
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      roles,
    },
  } as const;
}
