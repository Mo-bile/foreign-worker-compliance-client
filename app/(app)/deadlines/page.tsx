"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { toast } from "sonner";
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
  useCompleteDeadline,
} from "@/lib/queries/use-compliance";
import { useCompanyContext } from "@/lib/contexts/company-context";
import type { ComplianceFilterValues } from "@/lib/queries/use-compliance";
import {
  DEADLINE_TYPES,
  DEADLINE_TYPE_LABELS,
  DEADLINE_STATUSES,
  DEADLINE_STATUS_LABELS,
} from "@/types/api";
import type { DeadlineType, DeadlineStatus } from "@/types/api";

export default function CompliancePage() {
  const searchParams = useSearchParams();
  const { selectedCompanyId } = useCompanyContext();
  const typeFromUrl = searchParams.get("type") as DeadlineType | null;
  const [deadlineTypeFilter, setDeadlineTypeFilter] = useState<DeadlineType | "ALL">(
    typeFromUrl != null && (DEADLINE_TYPES as readonly string[]).includes(typeFromUrl)
      ? typeFromUrl
      : "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<DeadlineStatus | "ALL">("ALL");
  const [overduePage, setOverduePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const filters: ComplianceFilterValues = {
    deadlineType: deadlineTypeFilter,
    status: statusFilter,
  };

  const overdueAll = useOverdueDeadlines(selectedCompanyId);
  const overdue = usePaginatedOverdueDeadlines(selectedCompanyId, filters, overduePage);
  const upcoming = usePaginatedUpcomingDeadlines(30, selectedCompanyId, filters, upcomingPage);
  // useUpcomingDeadlines(30) is already called inside usePaginatedUpcomingDeadlines above,
  // so React Query deduplicates — no extra fetch for the chart.
  const upcomingAll = useUpcomingDeadlines(30, selectedCompanyId);

  const completeMutation = useCompleteDeadline();

  const handleComplete = useCallback(
    (id: number) => {
      completeMutation.mutate(id, {
        onSuccess: () => {
          toast.success("데드라인이 완료 처리되었습니다");
        },
      });
    },
    [completeMutation],
  );

  const resetPages = useCallback(() => {
    setOverduePage(1);
    setUpcomingPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">기한 관리</h1>

      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p>
            이 화면에서는 근로자별로 놓쳤거나 곧 다가오는 신고·갱신·보험 관련 기한을 확인할 수
            있습니다.
          </p>
          <p>기한이 지난 항목은 먼저 처리하고, 30일 안에 다가오는 항목은 미리 준비하세요.</p>
          <p>
            항목 종류와 처리 상태를 선택해 필요한 내용만 볼 수 있으며, 처리한 항목은 완료 처리해
            목록에서 상태를 관리할 수 있습니다.
          </p>
        </div>
      </div>

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
              <SelectValue placeholder="데드라인 유형 전체">{deadlineTypeFilter === "ALL" ? "전체" : DEADLINE_TYPE_LABELS[deadlineTypeFilter as DeadlineType]}</SelectValue>
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
              <SelectValue placeholder="상태 전체">{statusFilter === "ALL" ? "전체" : DEADLINE_STATUS_LABELS[statusFilter as DeadlineStatus]}</SelectValue>
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
        isError={overdue.isError}
        hasUnfilteredData={(overdueAll.data?.length ?? 0) > 0}
        onComplete={handleComplete}
        isCompleting={completeMutation.isPending}
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
          isError={upcoming.isError}
          hasUnfilteredData={(upcomingAll.data?.length ?? 0) > 0}
          onComplete={handleComplete}
          isCompleting={completeMutation.isPending}
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
        <DeadlineChart
          deadlines={upcomingAll.data}
          isLoading={upcomingAll.isLoading}
          isError={upcomingAll.isError}
        />
      </div>
    </div>
  );
}
