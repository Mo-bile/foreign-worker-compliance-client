"use client";

import { Users, AlertTriangle, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeadlineChart } from "@/components/dashboard/deadline-chart";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import { useWorkers } from "@/lib/queries/use-workers";
import { useOverdueDeadlines, useUpcomingDeadlines } from "@/lib/queries/use-compliance";

export default function DashboardPage() {
  const workers = useWorkers();
  const overdue = useOverdueDeadlines();
  const upcoming = useUpcomingDeadlines(30);

  const approachingCount = upcoming.data?.filter(
    (d) => d.status === "APPROACHING" || d.status === "URGENT",
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="전체 근로자"
          value={workers.data?.length}
          icon={Users}
          isLoading={workers.isLoading}
          isError={workers.isError}
          className="border-t-[color:var(--accent-decorative)]"
        />
        <StatCard
          title="기한초과"
          value={overdue.data?.length}
          icon={AlertTriangle}
          isLoading={overdue.isLoading}
          isError={overdue.isError}
          className="border-t-[color:var(--signal-red)]"
        />
        <StatCard
          title="임박 (30일)"
          value={approachingCount}
          icon={Clock}
          isLoading={upcoming.isLoading}
          isError={upcoming.isError}
          className="border-t-[color:var(--signal-orange)]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={overdue.data}
          isLoading={overdue.isLoading}
          isError={overdue.isError}
          limit={5}
        />
        <DeadlineChart
          deadlines={upcoming.data}
          isLoading={upcoming.isLoading}
          isError={upcoming.isError}
        />
      </div>
    </div>
  );
}
