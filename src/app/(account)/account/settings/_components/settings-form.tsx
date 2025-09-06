"use client";

import { updateProfile } from "@/actions/user";
import { changePassword, deleteAccount, updateSecuritySettings } from "@/actions/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { user as userSchema } from "@/lib/db/schema";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ProfileData } from "./profile-settings";
import { ProfileSettings } from "./profile-settings";
import { type PasswordData, type SecurityData, SecuritySettings } from "./security-settings";

// Define types based on Zod schemas from actions
type User = typeof userSchema.$inferSelect;

interface SettingsFormProps {
  user: User;
  avatarUrl: string | null;
  isTwoFactorEnabled: boolean;
}

export function SettingsForm({ user, avatarUrl, isTwoFactorEnabled }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleProfileSave = async (data: ProfileData) => {
    startTransition(() => {
      // Ensure null values are converted to undefined for Zod validation
      const payload = {
        ...data,
        bio: data.bio ?? undefined,
        location: data.location ?? undefined,
      };
      updateProfile(payload).then((res) => {
        if (res.error) {
          toast.error(JSON.stringify(res.error));
        } else if (res.success) {
          toast.success(res.success);
        }
      });
    });
  };

  const handleSecuritySave = async (data: SecurityData) => {
    startTransition(() => {
      updateSecuritySettings(data).then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else if (res.success) {
          toast.success(res.success);
        }
      });
    });
  };

  const handlePasswordChange = async (data: PasswordData) => {
    startTransition(() => {
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      }).then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else if (res.success) {
          toast.success(res.success);
        }
      });
    });
  };

  const handleDeleteAccount = async (data: { password?: string }) => {
    startTransition(() => {
      deleteAccount({ password: data.password }).then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else if (res.success) {
          toast.success(res.success);
          // Optional: redirect user after account deletion
          // window.location.href = "/";
        }
      });
    });
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings
          isPending={isPending}
          onSave={handleProfileSave}
          initialData={{
            name: user.name || "",
            email: user.email,
            bio: "", // This field can be populated from a separate profile table if it exists
            location: "",
            image: user.image || undefined,
            avatarUrl: avatarUrl,
          }}
        />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings
          isPending={isPending}
          initialData={{ loginAlerts: false, sessionTimeout: "24h" }}
          isTwoFactorEnabled={isTwoFactorEnabled}
          onSave={handleSecuritySave}
          onPasswordChange={handlePasswordChange}
          onDeleteAccount={handleDeleteAccount}
        />
      </TabsContent>
    </Tabs>
  );
}
