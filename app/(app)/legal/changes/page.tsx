"use client";

import { useState, useMemo } from "react";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { CATEGORY_ICONS } from "@/lib/constants/legal-change";
import { useLegalChanges } from "@/lib/queries/use-legal-changes";
import { FilterBar } from "@/components/legal/filter-bar";
import type { FilterValue } from "@/components/legal/filter-bar";
import { SyncStatus } from "@/components/legal/sync-status";
import { LegalTimeline } from "@/components/legal/legal-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import type { LegalChange } from "@/types/legal";
import type { SignalColor } from "@/types/shared";

type LegalStatus = "action_required" | "reference" | "resolved";
type LegalSeverity = "critical" | "warning" | "resolved";

interface TimelineLegalChange extends LegalChange {
  readonly icon: string;
  readonly detectedDate: string;
  readonly severity: LegalSeverity;
  readonly status: LegalStatus;
  readonly badge: {
    readonly text: string;
    readonly color: SignalColor;
  };
  readonly dDay?: number;
}

function getDDay(effectiveDate: string): number | undefined {
  const target = new Date(effectiveDate);
  if (Number.isNaN(target.getTime())) {
    return undefined;
  }

  const today = new Date();
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // dDay 규약: 양수 = 초과(overdue), 0 = 당일, 음수 = N일 남음
  return Math.ceil((todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
}

function toTimelineChange(change: LegalChange): TimelineLegalChange {
  const status: LegalStatus = change.acknowledged
    ? "resolved"
    : change.changeType === "ENFORCEMENT"
      ? "action_required"
      : "reference";
  const severity: LegalSeverity = status === "resolved" ? "resolved" : status === "action_required" ? "critical" : "warning";
  const badge =
    status === "resolved"
      ? { text: "확인 완료", color: "green" as const }
      : status === "action_required"
        ? { text: "조치 필요", color: "red" as const }
        : { text: "참고", color: "orange" as const };

  return {
    ...change,
    icon: CATEGORY_ICONS[change.category],
    detectedDate: change.effectiveDate,
    severity,
    status,
    badge,
    dDay: status === "resolved" ? undefined : getDDay(change.effectiveDate),
  };
}

function applyFilter(
  changes: readonly TimelineLegalChange[],
  filter: FilterValue,
): readonly TimelineLegalChange[] {
  switch (filter) {
    case "all":
      return changes;
    case "affected":
    case "action_required":
      return changes.filter((change) => !change.acknowledged);
    case "resolved":
      return changes.filter((change) => change.acknowledged);
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

  const timelineChanges = useMemo(() => (data ?? []).map(toTimelineChange), [data]);
  const filterCounts = useMemo<Readonly<Record<FilterValue, number>>>(() => {
    const changes = data ?? [];
    const acknowledgedCount = changes.filter((change) => change.acknowledged).length;
    const unacknowledgedCount = changes.length - acknowledgedCount;

    return {
      all: changes.length,
      affected: unacknowledgedCount,
      action_required: unacknowledgedCount,
      resolved: acknowledgedCount,
    };
  }, [data]);
  const filteredChanges = useMemo(
    () => applyFilter(timelineChanges, filter),
    [timelineChanges, filter],
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

  if (timelineChanges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">등록된 법령 변경이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--signal-blue)]/20 bg-signal-blue-bg p-4 text-sm">
        <p className="font-semibold text-signal-blue">✦ AI 기반 법령 영향 분석</p>
        <p className="mt-1 text-muted-foreground">
          법령 영향 분석은 AI가 사업장 정보·근로자 분포·비자 구성을 기반으로 자동
          생성합니다. 본 분석은 관리 보조 목적이며 법률 자문이 아닙니다.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          ⚠️ 데모용 시드 데이터입니다. 실제 시행 일정은 법제처 또는 관할 기관에서 확인하세요.
        </p>
      </div>
      <div className="flex items-center justify-between">
        <FilterBar activeFilter={filter} counts={filterCounts} onFilterChange={setFilter} />
        <SyncStatus />
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
