import type { ReactElement } from "react";

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
}

/**
 * Generic page header with title and optional description.
 * Uses semantic color tokens for consistent contrast across themes.
 */
export function PageHeader({ title, description }: PageHeaderProps): ReactElement {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
    </div>
  );
}
