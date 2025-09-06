import type React from "react";

/**
 * Page header container with title, optional description, and optional right-aligned actions.
 * Uses semantic color tokens to ensure adequate contrast in light and dark themes.
 */
interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  );
}
