import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
  type?: "info" | "warning" | "danger";
}

const calloutStyles = {
  info: {
    container: "bg-muted border-l-4 border-primary text-foreground",
    icon: "text-primary",
  },
  warning: {
    container: "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700",
    icon: "text-yellow-500",
  },
  danger: {
    container: "bg-red-100 border-l-4 border-red-500 text-red-700",
    icon: "text-red-500",
  },
};

export function Callout({ children, type = "info" }: CalloutProps) {
  const styles = calloutStyles[type];

  return (
    <div className={`p-4 my-4 rounded-md ${styles.container}`}>
      <div className="flex items-start">
        <div className={`mr-3 mt-1 ${styles.icon}`}>
          <Info className="h-5 w-5" />
        </div>
        <div className="prose-p:my-0 prose-p:leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
