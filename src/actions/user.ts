"use server";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { user } from "../../auth-schema";

// Profile schema removed as it's only used as a type

export async function getUserProfile() {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const data = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: {
      profile: true,
    },
  });

  if (!data) {
    return { error: "User not found." };
  }

  return { profile: data };
}

export async function updateProfileAction(data: {
  name: string;
  bio?: string;
  location?: string;
  image?: string;
}) {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  // Validation removed as schema is no longer defined

  // Validation removed as schema is no longer defined

  try {
    const { name, image } = data;

    await db.update(user).set({ name, image }).where(eq(user.id, session.user.id));

    // This part seems to be for a separate userProfile table which is not fully implemented in the settings form.
    // We will focus on updating the main user table for now.
    // If a separate profile table is needed, the logic can be expanded here.

    return { success: "Profile updated successfully" };
  } catch {
    return { error: "An unexpected error occurred." };
  }
}

// Create separate async functions for each export to comply with "use server" rules
export async function updateProfile(data: {
  name: string;
  bio?: string;
  location?: string;
  image?: string;
}) {
  return updateProfileAction(data);
}

// Notification settings schema removed as it's only used as a type

export async function updateNotificationSettings(data: {
  emailComments: boolean;
  emailLikes: boolean;
  emailFollows: boolean;
  emailNewsletter: boolean;
}) {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }
  // TODO: Implement actual logic to save notification settings
  console.log("Updating notification settings:", data);
  return { success: "Notification settings updated (mock)" };
}

// Security settings schema removed as it's only used as a type

export async function updateSecuritySettings(data: {
  loginAlerts: boolean;
  sessionTimeout: string;
}) {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" };
  }
  // TODO: Implement actual logic to save security settings
  console.log("Updating security settings:", data);
  return { success: "Security settings updated (mock)" };
}

/**
 * Change the current user's password.
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" } as const;
  }
  const { currentPassword, newPassword, revokeOtherSessions = true } = data;
  if (!currentPassword || !newPassword) {
    return { error: "Current and new password are required." } as const;
  }
  try {
    await auth.api.changePassword({
      headers: new Headers(await headers()),
      body: { currentPassword, newPassword, revokeOtherSessions },
    });
    return { success: "Password changed successfully" } as const;
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message } as const;
    }
    console.error("Change password error:", error);
    return { error: "Failed to change password. Please try again." } as const;
  }
}

/**
 * Permanently delete the current user's account.
 * If the user has a password, pass it to satisfy Better Auth requirements.
 * If session is fresh and delete verification is configured, password may be omitted.
 */
export async function deleteAccount(data: { password?: string }) {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) });
  if (!session?.user) {
    return { error: "Not authenticated" } as const;
  }
  try {
    await auth.api.deleteUser({
      headers: new Headers(await headers()),
      body: data.password ? { password: data.password } : {},
    });
    return { success: "Account deleted successfully" } as const;
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message } as const;
    }
    console.error("Delete account error:", error);
    return { error: "Failed to delete account. Please try again." } as const;
  }
}
