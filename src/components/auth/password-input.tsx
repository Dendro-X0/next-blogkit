"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState } from "react";

/**
 * Password input with a show/hide toggle.
 * - Accessible toggle button uses aria-pressed and dynamic aria-label/title.
 */
export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
          disabled={props.disabled}
          aria-pressed={showPassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
