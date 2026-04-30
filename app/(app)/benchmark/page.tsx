"use client";

import { useState } from "react";
import { Info } from "lucide-react";
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
import { AiAnalysisProgress } from "@/components/common/ai-analysis-progress";
import { NullableAxisPlaceholder } from "@/components/benchmark/nullable-axis-placeholder";

export default function BenchmarkPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data: benchmarks, isLoading, isError, error } = useBenchmarkList(selectedCompanyId);
  const createBenchmark = useCreateBenchmark();
  const [activeChecklistCategory, setActiveChecklistCategory] = useState<string | null>(null);
  const [activeReasonLabel, setActiveReasonLabel] = useState<string | null>(null);

  const handleReasonClick = (category: string, reasonLabel: string) => {
    setActiveChecklistCategory(category);
    setActiveReasonLabel(reasonLabel);
    // intentional DOM access — id is defined in ManagementCheckCard, couples via string
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

  const infoBox = (
    <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p>사업장 진단 리포트는 회사 및 근로자 데이터와 외부 기준 데이터를 함께 분석합니다.</p>
        <p>
          임금 구간, E-9 퇴사 사유, 관리 체크리스트, 지역/업종 포지셔닝 기준을 바탕으로
          현재 사업장의 관리 상태를 진단합니다.
        </p>
        <p>
          일부 항목은 현재 등록된 사업장 정보와 근로자 정보의 입력 완성도에 따라 결과가 제한될 수
          있습니다.
        </p>
      </div>
    </div>
  );

  if (isLoading) return <BenchmarkSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">벤치마크 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <div className="space-y-4">
        {infoBox}
        <BenchmarkEmptyState
          onCreateBenchmark={handleCreateBenchmark}
          isLoading={createBenchmark.isPending}
        />
        <AiAnalysisProgress variant="benchmark" isPending={createBenchmark.isPending} />
      </div>
    );
  }

  const latest = benchmarks[0];

  return (
    <div className="space-y-5">
      {infoBox}
      <BenchmarkHeader
        analyzedAt={latest.analyzedAt}
        onCreateBenchmark={handleCreateBenchmark}
        isCreating={createBenchmark.isPending}
      />
      <AiAnalysisProgress variant="benchmark" isPending={createBenchmark.isPending} />

      {/* 상단: Score Ring + 4축 요약 Stat Cards */}
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <ScoreRingCard
          managementScore={latest.managementScore}
          grade={latest.managementGrade}
          analyzedAt={latest.analyzedAt}
        />
        <BenchmarkStatCards benchmark={latest} />
      </div>

      {/* AI 종합 안내 */}
      <AiReportSection aiReport={latest.aiReport} />

      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-xs font-bold tracking-wide text-muted-foreground">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[oklch(0.6_0.15_255)]" />
            포지셔닝
          </p>
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
            <PositioningCard positioningAnalysis={latest.positioningAnalysis} />
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-2">
          <p className="text-xs font-bold tracking-wide text-muted-foreground">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[oklch(0.65_0.18_55)]" />
            진단 &amp; 개선
          </p>
          <div className="grid grid-cols-2 gap-4">
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
              filterReasonLabel={activeReasonLabel}
              onClearFilter={() => {
                setActiveChecklistCategory(null);
                setActiveReasonLabel(null);
              }}
            />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 정확한 법률 판단은 전문가와 상담하세요.
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
