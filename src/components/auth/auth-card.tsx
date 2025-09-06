import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type React from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * AuthCard renders a centered card for auth pages.
 */
export function AuthCard({
  title,
  description,
  children,
  icon,
}: AuthCardProps): React.ReactElement {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
