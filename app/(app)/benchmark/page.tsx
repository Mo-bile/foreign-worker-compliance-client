"use client";

import { useCompanyContext } from "@/lib/contexts/company-context";
import { useBenchmark } from "@/lib/queries/use-benchmark";
import { Skeleton } from "@/components/ui/skeleton";
import { BenchmarkHeader } from "@/components/benchmark/benchmark-header";
import { ScoreRingCard } from "@/components/benchmark/score-ring-card";
import { AiSummaryBlock } from "@/components/benchmark/ai-summary-block";
import { QuickActionCards } from "@/components/benchmark/quick-action-cards";
import { WageCard } from "@/components/benchmark/wage-card";
import { AttritionCard } from "@/components/benchmark/attrition-card";
import { DependencyCard } from "@/components/benchmark/dependency-card";
import { TrendCard } from "@/components/benchmark/trend-card";

export default function BenchmarkPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data, isLoading, isError, error } = useBenchmark(selectedCompanyId);

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          벤치마크 리포트를 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) return <BenchmarkSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">벤치마크 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <BenchmarkHeader reportPeriod={data.reportPeriod} />

      <div className="grid grid-cols-[300px_1fr] gap-4">
        <ScoreRingCard score={data.score} analyzedAt={data.analyzedAt} />
        <div className="space-y-4">
          <AiSummaryBlock html={data.aiSummary} />
          <QuickActionCards actions={data.quickActions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WageCard data={data.wage} defaultInsightOpen />
        <AttritionCard data={data.attrition} />
        <DependencyCard data={data.dependency} />
        <TrendCard data={data.trend} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ⚖ 본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 공공데이터 기준 시점: 2026년 1분기
      </p>
    </div>
  );
}

function BenchmarkSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-[300px_1fr] gap-4">
        <Skeleton className="h-80 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}
