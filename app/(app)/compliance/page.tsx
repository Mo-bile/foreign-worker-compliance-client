"use client";

import { DeadlineTable } from "@/components/compliance/deadline-table";
import { DeadlineChart } from "@/components/dashboard/deadline-chart";
import { useOverdueDeadlines, useUpcomingDeadlines } from "@/lib/queries/use-compliance";

export default function CompliancePage() {
  const overdue = useOverdueDeadlines();
  const upcoming = useUpcomingDeadlines(30);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">컴플라이언스 현황</h1>

      <DeadlineTable
        title="기한초과 데드라인"
        deadlines={overdue.data}
        isLoading={overdue.isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DeadlineTable
          title="임박 데드라인 (30일)"
          deadlines={upcoming.data}
          isLoading={upcoming.isLoading}
        />
        <DeadlineChart
          deadlines={upcoming.data}
          isLoading={upcoming.isLoading}
        />
      </div>
    </div>
  );
}
