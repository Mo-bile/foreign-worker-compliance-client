"use client";

import { useState, useMemo } from "react";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useLegalChanges } from "@/lib/queries/use-legal-changes";
import { FilterBar } from "@/components/legal/filter-bar";
import type { FilterValue } from "@/components/legal/filter-bar";
import { SyncStatus } from "@/components/legal/sync-status";
import { LegalTimeline } from "@/components/legal/legal-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import type { LegalChange } from "@/types/legal";

function applyFilter(
  changes: readonly LegalChange[],
  filter: FilterValue,
): readonly LegalChange[] {
  switch (filter) {
    case "all":
      return changes;
    case "affected":
      return changes.filter((c) => c.status !== "resolved");
    case "action_required":
      return changes.filter((c) => c.status === "action_required");
    case "resolved":
      return changes.filter((c) => c.status === "resolved");
    default: {
      const _exhaustive: never = filter;
      return changes;
    }
  }
}

export default function LegalChangesPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError, error, refetch } = useLegalChanges(selectedCompanyId);
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredChanges = useMemo(
    () => applyFilter(data?.changes ?? [], filter),
    [data?.changes, filter],
  );

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          법령 변경 알림을 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) return <LegalChangesSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">법령 변경 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-xs text-primary hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) return <LegalChangesSkeleton />;

  if (data.changes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">등록된 법령 변경이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        <SyncStatus lastSyncedAt={data.lastSyncedAt} />
      </div>
      {filteredChanges.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">해당 필터에 맞는 법령 변경이 없습니다</p>
        </div>
      ) : (
        <LegalTimeline changes={filteredChanges} companyId={selectedCompanyId} />
      )}
    </div>
  );
}

function LegalChangesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="space-y-4 pl-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
