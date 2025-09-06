import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemStatusProps {
  status: {
    database: "healthy" | "warning" | "error";
    cache: "optimal" | "warning" | "error";
    storage: {
      used: number;
      total: number;
    };
  };
}

export function SystemStatus({ status }: SystemStatusProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "healthy":
      case "optimal":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const storagePercentage = Math.round((status.storage.used / status.storage.total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current system health</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Database</span>
          <Badge variant={getStatusVariant(status.database)}>
            {status.database.charAt(0).toUpperCase() + status.database.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Cache</span>
          <Badge variant={getStatusVariant(status.cache)}>
            {status.cache.charAt(0).toUpperCase() + status.cache.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Storage</span>
          <Badge variant={storagePercentage > 80 ? "secondary" : "default"}>
            {storagePercentage}% Used
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
