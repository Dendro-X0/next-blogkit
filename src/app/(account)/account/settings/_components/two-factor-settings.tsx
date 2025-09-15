"use client";

import { disableTwoFactor, enableTwoFactor, generateTwoFactorSecret } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import QRCode from "qrcode";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

interface TwoFactorSettingsProps {
  isTwoFactorEnabled: boolean;
}

export function TwoFactorSettings({
  isTwoFactorEnabled: initialIsTwoFactorEnabled,
}: TwoFactorSettingsProps) {
  const uid = useId();
  const fid = (name: string): string => `${uid}-${name}`;
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(initialIsTwoFactorEnabled);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [enablePassword, setEnablePassword] = useState<string>("");
  const [disablePassword, setDisablePassword] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleGenerateSecret = async (): Promise<void> => {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("password", enablePassword);
        const result = await generateTwoFactorSecret(undefined, fd);
        if (result.error) {
          toast.error(result.error);
        } else {
          if (result.totpUri) {
            const dataUrl = await QRCode.toDataURL(result.totpUri);
            setQrCode(dataUrl);
            try {
              const url = new URL(result.totpUri);
              setSecret(url.searchParams.get("secret"));
            } catch {
              setSecret(null);
            }
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to generate 2FA secret. Please try again.");
      }
    });
  };

  const handleEnableTwoFactor = async (): Promise<void> => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("code", code);
        const result = await enableTwoFactor({ error: "" }, formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Two-Factor Authentication has been enabled.");
          setIsTwoFactorEnabled(true);
          setIsDialogOpen(false);
          setQrCode(null);
          setSecret(null);
          setCode("");
          setEnablePassword("");
        }
      } catch (error) {
        console.error(error);
        toast.error("Invalid 2FA code. Please try again.");
      }
    });
  };

  const handleDisableTwoFactor = async (): Promise<void> => {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("password", disablePassword);
        const result = await disableTwoFactor(undefined, fd);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Two-Factor Authentication has been disabled.");
          setIsTwoFactorEnabled(false);
          setDisableOpen(false);
          setDisablePassword("");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to disable 2FA. Please try again.");
      }
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="font-medium">Two-Factor Authentication</Label>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isTwoFactorEnabled ? (
          <>
            <Badge variant="default">Enabled</Badge>
            <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isPending}>
                  Disable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                  <DialogDescription>Enter your password to disable 2FA.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  <Label htmlFor={fid("disable-password")}>
                    Password
                  </Label>
                  <Input
                    id={fid("disable-password")}
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isPending}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleDisableTwoFactor} disabled={isPending || !disablePassword}>
                    Disable 2FA
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isPending}>
                Enable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Enter your password, then scan the QR code with your authenticator app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={fid("enable-password")}>
                    Password
                  </Label>
                  <Input
                    id={fid("enable-password")}
                    type="password"
                    value={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isPending || Boolean(qrCode)}
                  />
                </div>
                <div>
                  <Button
                    onClick={handleGenerateSecret}
                    disabled={isPending || !enablePassword || Boolean(qrCode)}
                  >
                    {qrCode ? "Secret Generated" : "Generate Secret"}
                  </Button>
                </div>
                {isPending && !qrCode && <p>Generating QR code...</p>}
                {qrCode && (
                  <div className="flex flex-col items-center gap-4">
                    <Image src={qrCode} alt="QR Code" width={200} height={200} />
                    <p className="text-sm text-muted-foreground">Or enter this code manually:</p>
                    <code className="bg-muted p-2 rounded-md font-mono text-sm">{secret}</code>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor={fid("2fa-code")}>
                    Verification Code
                  </Label>
                  <Input
                    id={fid("2fa-code")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    disabled={isPending}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleEnableTwoFactor} disabled={isPending || !code || !qrCode}>
                  Verify & Enable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
