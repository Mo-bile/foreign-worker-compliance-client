"use client";

import Link from "next/link";
import type { CompanyDerivedCountsResponse } from "@/types/api";

interface ForeignWorkerStatusSectionProps {
  readonly derivedCounts: CompanyDerivedCountsResponse;
}

export function ForeignWorkerStatusSection({ derivedCounts }: ForeignWorkerStatusSectionProps) {
  const {
    activeForeignWorkerCount,
    upcomingForeignWorkerCount,
    reviewRequiredForeignWorkerCount,
    recentYearEndedForeignWorkerCount,
    activeE9WorkerCount,
  } = derivedCounts;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">외국인 근로자 현황</p>
        <p className="text-xs text-muted-foreground">자동 집계 (수정 불가)</p>
      </div>
      <dl className="grid gap-3 md:grid-cols-4">
        <CountStat label="재직중 (전체)" value={activeForeignWorkerCount} colorVar="--signal-green" />
        <CountStat label="입사 예정" value={upcomingForeignWorkerCount} colorVar="--signal-blue" />
        <CountStat
          label="계약종료 확인 필요"
          value={reviewRequiredForeignWorkerCount}
          colorVar="--signal-orange"
          action={
            reviewRequiredForeignWorkerCount > 0 ? (
              <Link href="/workers" className="text-xs text-primary hover:underline">
                확인하기 →
              </Link>
            ) : null
          }
        />
        <CountStat label="최근 1년 고용종료" value={recentYearEndedForeignWorkerCount} colorVar="--signal-gray" />
      </dl>
      <div className="border-t pt-3">
        <CountStat
          label="현재 재직 E-9 근로자 수"
          value={activeE9WorkerCount}
          colorVar="--signal-green"
          hint="E-9 고용허가 시뮬레이션 기준"
        />
      </div>
    </div>
  );
}

function CountStat({
  label, value, colorVar, action, hint,
}: {
  readonly label: string;
  readonly value: number;
  readonly colorVar: string;
  readonly action?: React.ReactNode;
  readonly hint?: string;
}) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold" style={{ color: `var(${colorVar})` }}>
        {value}명
      </dd>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}
