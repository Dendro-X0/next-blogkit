"use client";

import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const requirements: PasswordRequirement[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = requirements.filter((req) => req.met).length;

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress value={(strength / 5) * 100} className="flex-1 h-2" />
        <span className="text-xs text-muted-foreground">{strength}/5</span>
      </div>

      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((req) => (
            <div key={req.label} className="flex items-center gap-2 text-xs">
              {req.met ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={req.met ? "text-success" : "text-muted-foreground"}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
