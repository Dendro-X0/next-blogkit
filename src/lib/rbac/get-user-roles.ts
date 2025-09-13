import { db } from "@/lib/db";
import { roles, userRoles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { RoleSlug } from "./types";

export default async function getUserRoles(userId: string): Promise<readonly RoleSlug[]> {
  const rows = await db
    .select({ slug: roles.slug })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId)));
  const list = rows.map((r) => r.slug as RoleSlug);
  return Array.from(new Set(list)) as readonly RoleSlug[];
}
