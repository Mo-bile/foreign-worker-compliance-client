"use client";

import { Lightbulb } from "lucide-react";
import { SimulationForm } from "@/components/simulator/simulation-form";
import { ResultVerdict } from "@/components/simulator/result-verdict";
import { ResultStats } from "@/components/simulator/result-stats";
import { AnalysisCard } from "@/components/simulator/analysis-card";
import { RecommendationBox } from "@/components/simulator/recommendation-box";
import { useSimulation } from "@/lib/queries/use-simulation";
import { SimulationProgress } from "@/components/simulator/simulation-progress";
import { useCompanyContext } from "@/lib/contexts/company-context";
import type { NationalityAnalysis, AnalysisSection } from "@/types/simulator";

function toNationalitySection(n: NationalityAnalysis): AnalysisSection {
  return {
    id: "nationality",
    icon: "Globe",
    title: "국적별 현황 분석",
    badge: {
      text: n.trend === "up" ? "증가" : n.trend === "down" ? "감소" : "유지",
      color: n.trend === "up" ? "green" : n.trend === "down" ? "red" : "gray",
    },
    dataRows: [
      { key: "선호 국적 비율", value: `${n.percentage}%` },
      { key: "전국 평균 비율", value: `${n.avgPercentage}%` },
    ],
    progress: null,
    dataSources: [],
    aiInsight: `선호 국적의 배정 비율이 전국 평균 대비 ${n.percentage > n.avgPercentage ? "높습니다" : "낮습니다"}.`,
  };
}

export default function SimulatorPage() {
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  const mutation = useSimulation(selectedCompanyId);

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          시뮬레이션을 실행하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  const result = mutation.data;

  return (
    <div className="grid grid-cols-[380px_1fr] gap-6">
      {/* Left: Form (sticky) */}
      <div className="sticky top-6 self-start">
        <SimulationForm
          company={selectedCompany}
          onSubmit={(data) => mutation.mutate(data)}
          isPending={mutation.isPending}
        />
      </div>

      {/* Right: Result area */}
      <div className="space-y-4">
        <SimulationProgress isPending={mutation.isPending} />

        {mutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">시뮬레이션 분석에 실패했습니다</p>
            <p className="mt-1 text-xs text-muted-foreground">{mutation.error?.message}</p>
          </div>
        )}

        {!result && !mutation.isPending && !mutation.isError && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Lightbulb className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              시뮬레이션을 실행하면 분석 결과가 여기에 표시됩니다
            </p>
          </div>
        )}

        {result && (
          <>
            <ResultVerdict
              verdict={result.verdict}
              verdictText={result.verdictText}
              summary={result.summary}
              analyzedAt={result.analyzedAt}
              dataSourceCount={result.dataSourceCount}
            />
            <ResultStats stats={result.stats} />
            {result.analyses.map((section) => (
              <AnalysisCard key={section.id} section={section} defaultOpen />
            ))}
            {result.nationality !== null && (
              <AnalysisCard section={toNationalitySection(result.nationality)} defaultOpen />
            )}
            <RecommendationBox recommendations={result.recommendations} />
          </>
        )}
      </div>
    </div>
  );
}
