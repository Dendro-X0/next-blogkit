import { StatsCard } from "@/components/ui/stats-card";
import { FileText, MessageSquare, Users } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Posts"
        value={stats.totalPosts}
        description="from last month"
        icon={FileText}
        trend={{ value: "+2", isPositive: true }}
      />
      <StatsCard
        title="Total Users"
        value={stats.totalUsers}
        description="from last month"
        icon={Users}
        trend={{ value: "+12", isPositive: true }}
      />
      <StatsCard
        title="Comments"
        value={stats.totalComments}
        description="from last week"
        icon={MessageSquare}
        trend={{ value: "+5", isPositive: true }}
      />
    </div>
  );
}
