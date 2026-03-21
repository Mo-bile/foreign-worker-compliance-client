"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import { DeadlineChart } from "@/components/dashboard/deadline-chart";
import {
  useOverdueDeadlines,
  usePaginatedOverdueDeadlines,
  usePaginatedUpcomingDeadlines,
  useUpcomingDeadlines,
} from "@/lib/queries/use-compliance";
import type { ComplianceFilterValues } from "@/lib/queries/use-compliance";
import {
  DEADLINE_TYPES,
  DEADLINE_TYPE_LABELS,
  DEADLINE_STATUSES,
  DEADLINE_STATUS_LABELS,
} from "@/types/api";
import type { DeadlineType, DeadlineStatus } from "@/types/api";

export default function CompliancePage() {
  const [deadlineTypeFilter, setDeadlineTypeFilter] = useState<DeadlineType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<DeadlineStatus | "ALL">("ALL");
  const [overduePage, setOverduePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const filters: ComplianceFilterValues = {
    deadlineType: deadlineTypeFilter,
    status: statusFilter,
  };

  const overdueAll = useOverdueDeadlines();
  const overdue = usePaginatedOverdueDeadlines(filters, overduePage);
  const upcoming = usePaginatedUpcomingDeadlines(30, filters, upcomingPage);
  // Chart uses same queryKey as usePaginatedUpcomingDeadlines → no extra fetch
  const upcomingAll = useUpcomingDeadlines(30);

  const resetPages = useCallback(() => {
    setOverduePage(1);
    setUpcomingPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">컴플라이언스 현황</h1>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <span className="text-sm text-muted-foreground">필터:</span>
          <Select
            value={deadlineTypeFilter}
            onValueChange={(v) => {
              setDeadlineTypeFilter(v as DeadlineType | "ALL");
              resetPages();
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="데드라인 유형 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {DEADLINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {DEADLINE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as DeadlineStatus | "ALL");
              resetPages();
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="상태 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {DEADLINE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {DEADLINE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <DeadlineTable
        title="기한초과 데드라인"
        deadlines={overdue.deadlines?.items}
        isLoading={overdue.isLoading}
        hasUnfilteredData={(overdueAll.data?.length ?? 0) > 0}
        pagination={
          overdue.deadlines && overdue.deadlines.totalPages > 0
            ? {
                currentPage: overdue.deadlines.currentPage,
                totalPages: overdue.deadlines.totalPages,
                totalItems: overdue.deadlines.totalItems,
                pageSize: overdue.deadlines.pageSize,
                onPageChange: setOverduePage,
              }
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DeadlineTable
          title="임박 데드라인 (30일)"
          deadlines={upcoming.deadlines?.items}
          isLoading={upcoming.isLoading}
          hasUnfilteredData={(upcomingAll.data?.length ?? 0) > 0}
          pagination={
            upcoming.deadlines && upcoming.deadlines.totalPages > 0
              ? {
                  currentPage: upcoming.deadlines.currentPage,
                  totalPages: upcoming.deadlines.totalPages,
                  totalItems: upcoming.deadlines.totalItems,
                  pageSize: upcoming.deadlines.pageSize,
                  onPageChange: setUpcomingPage,
                }
              : undefined
          }
        />
        <DeadlineChart deadlines={upcomingAll.data} isLoading={upcomingAll.isLoading} />
      </div>
    </div>
  );
}
