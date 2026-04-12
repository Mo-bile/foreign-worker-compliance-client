"use client";

import { useState } from "react";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useBenchmarkList, useCreateBenchmark } from "@/lib/queries/use-benchmark";
import { Skeleton } from "@/components/ui/skeleton";
import { BenchmarkHeader } from "@/components/benchmark/benchmark-header";
import { ScoreRingCard } from "@/components/benchmark/score-ring-card";
import { BenchmarkStatCards } from "@/components/benchmark/benchmark-stat-cards";
import { AiReportSection } from "@/components/benchmark/ai-report-section";
import { WageAnalysisCard } from "@/components/benchmark/wage-analysis-card";
import { StabilityAnalysisCard } from "@/components/benchmark/stability-analysis-card";
import { ManagementCheckCard } from "@/components/benchmark/management-check-card";
import { PositioningCard } from "@/components/benchmark/positioning-card";
import { BenchmarkEmptyState } from "@/components/benchmark/benchmark-empty-state";
import { NullableAxisPlaceholder } from "@/components/benchmark/nullable-axis-placeholder";

export default function BenchmarkPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data: benchmarks, isLoading, isError, error } = useBenchmarkList(selectedCompanyId);
  const createBenchmark = useCreateBenchmark();
  const [activeChecklistCategory, setActiveChecklistCategory] = useState<string | null>(null);

  const handleReasonClick = (category: string) => {
    setActiveChecklistCategory(category);
    document.getElementById("management-check-card")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateBenchmark = () => {
    if (selectedCompanyId == null) return;
    createBenchmark.mutate({ companyId: selectedCompanyId });
  };

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
        <p className="text-sm font-medium text-destructive">
          벤치마크 조회에 실패했습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <BenchmarkEmptyState
        onCreateBenchmark={handleCreateBenchmark}
        isLoading={createBenchmark.isPending}
      />
    );
  }

  const latest = benchmarks[0];

  return (
    <div className="space-y-5">
      <BenchmarkHeader
        analyzedAt={latest.analyzedAt}
        onCreateBenchmark={handleCreateBenchmark}
        isCreating={createBenchmark.isPending}
      />

      {/* 상단: Score Ring + 4축 요약 Stat Cards */}
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <ScoreRingCard
          managementScore={latest.managementScore}
          analyzedAt={latest.analyzedAt}
        />
        <BenchmarkStatCards benchmark={latest} />
      </div>

      {/* AI 종합 분석 */}
      <AiReportSection aiReport={latest.aiReport} />

      {/* 4축 상세 카드 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {latest.wageAnalysis ? (
          <WageAnalysisCard wageAnalysis={latest.wageAnalysis} />
        ) : (
          <NullableAxisPlaceholder
            title="임금 구간 포지셔닝"
            fieldLabel="평균 월임금"
            companyId={selectedCompanyId}
          />
        )}

        {latest.stabilityAnalysis ? (
          <StabilityAnalysisCard
            stabilityAnalysis={latest.stabilityAnalysis}
            onReasonClick={handleReasonClick}
          />
        ) : (
          <NullableAxisPlaceholder
            title="고용 안정성"
            fieldLabel="최근 1년 퇴사 외국인 수"
            companyId={selectedCompanyId}
          />
        )}

        <ManagementCheckCard
          managementCheck={latest.managementCheck}
          filterCategory={activeChecklistCategory}
          onClearFilter={() => setActiveChecklistCategory(null)}
        />
        <PositioningCard positioningAnalysis={latest.positioningAnalysis} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 정확한 법률 판단은
        전문가와 상담하세요.
      </p>
    </div>
  );
}

function BenchmarkSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <Skeleton className="h-60 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
