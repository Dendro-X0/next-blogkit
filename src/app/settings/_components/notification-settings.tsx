"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Save, Smartphone } from "lucide-react";
import { useState } from "react";

export interface NotificationData {
  emailComments: boolean;
  emailLikes: boolean;
  emailFollows: boolean;
  emailNewsletter: boolean;
  pushComments: boolean;
  pushLikes: boolean;
  pushFollows: boolean;
  pushNewPosts: boolean;
}

interface NotificationSettingsProps {
  isPending: boolean;
  initialData: NotificationData;
  onSave: (data: NotificationData) => Promise<void>;
}

export function NotificationSettings({
  isPending,
  initialData,
  onSave,
}: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState<NotificationData>(initialData);

  const handleSave = async () => {
    try {
      await onSave(notifications);
    } catch {
      // Error is handled by the parent component's toast
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what email notifications you&apos;d like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Comments on your posts</Label>
              <p className="text-sm text-muted-foreground">
                We&apos;ll email you when someone comments on your posts.
              </p>
            </div>
            <Switch
              checked={notifications.emailComments}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, emailComments: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Likes on your posts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone likes your posts
              </p>
            </div>
            <Switch
              checked={notifications.emailLikes}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, emailLikes: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">New followers</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
            </div>
            <Switch
              checked={notifications.emailFollows}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, emailFollows: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Receive our weekly newsletter with platform updates
              </p>
            </div>
            <Switch
              checked={notifications.emailNewsletter}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, emailNewsletter: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Manage push notifications for the mobile app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Comments</Label>
              <p className="text-sm text-muted-foreground">Push notifications for new comments</p>
            </div>
            <Switch
              checked={notifications.pushComments}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, pushComments: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Likes</Label>
              <p className="text-sm text-muted-foreground">Push notifications for new likes</p>
            </div>
            <Switch
              checked={notifications.pushLikes}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, pushLikes: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Followers</Label>
              <p className="text-sm text-muted-foreground">Push notifications for new followers</p>
            </div>
            <Switch
              checked={notifications.pushFollows}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, pushFollows: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">New posts from followed users</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when people you follow publish new posts
              </p>
            </div>
            <Switch
              checked={notifications.pushNewPosts}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, pushNewPosts: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </>
        )}
      </Button>
    </div>
  );
}
