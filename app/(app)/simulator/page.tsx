"use client";

import { useState } from "react";
import { SimulationForm } from "@/components/simulator/simulation-form";
import { InputGuide } from "@/components/simulator/input-guide";
import { ResultSummarySidebar } from "@/components/simulator/result-summary-sidebar";
import { VerdictCard } from "@/components/simulator/verdict-card";
import { ScoringSection } from "@/components/simulator/scoring-section";
import { QuotaSection } from "@/components/simulator/quota-section";
import { TimelineSection } from "@/components/simulator/timeline-section";
import { AiSummarySection } from "@/components/simulator/ai-summary-section";
import { WhatIfSection } from "@/components/simulator/what-if-section";
import { RecommendationBox } from "@/components/simulator/recommendation-box";
import { SimulationProgress } from "@/components/simulator/simulation-progress";
import { useSimulation } from "@/lib/queries/use-simulation";
import { useCompanyContext } from "@/lib/contexts/company-context";
import type { SimulationRequest } from "@/types/simulator";

export default function SimulatorPage() {
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  const mutation = useSimulation(selectedCompanyId);
  const [lastRequest, setLastRequest] = useState<SimulationRequest | null>(null);

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
  const isExceeded = result?.verdict.verdict === "EXCEEDED";

  function handleSubmit(data: SimulationRequest) {
    setLastRequest(data);
    mutation.mutate(data);
  }

  function handleEdit() {
    mutation.reset();
    setLastRequest(null);
  }

  // ─── Input mode ───
  if (!result && !mutation.isPending && !mutation.isError) {
    return (
      <div className="grid grid-cols-[380px_1fr] gap-6">
        <div className="sticky top-6 self-start">
          <SimulationForm
            company={selectedCompany}
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
        </div>
        <InputGuide />
      </div>
    );
  }

  // ─── Loading / Error / Result mode ───
  return (
    <div className="grid grid-cols-[380px_1fr] gap-6">
      {/* Left sidebar */}
      <div className="sticky top-6 self-start">
        {result && lastRequest ? (
          <ResultSummarySidebar
            request={lastRequest}
            company={selectedCompany}
            estimatedScore={result.scoring.estimatedScore}
            isExceeded={isExceeded ?? false}
            onEdit={handleEdit}
          />
        ) : (
          <SimulationForm
            company={selectedCompany}
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
        )}
      </div>

      {/* Right content */}
      <div className="space-y-4">
        <SimulationProgress isPending={mutation.isPending} />

        {mutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              시뮬레이션 분석에 실패했습니다
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의하세요.
            </p>
            {lastRequest && (
              <button
                type="button"
                onClick={() => mutation.mutate(lastRequest)}
                disabled={mutation.isPending}
                className="mt-3 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다시 시도
              </button>
            )}
          </div>
        )}

        {result && (
          <>
            {/* ① Verdict Card */}
            <VerdictCard data={result.verdict} />

            {/* Exceeded info banner */}
            {isExceeded && (
              <div className="rounded-lg border-l-[3px] border-signal-orange bg-secondary p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  한도 초과로 현재 신청이 불가하지만, 참고용 정보를 확인할 수 있습니다
                </p>
              </div>
            )}

            {/* ② Scoring */}
            <ScoringSection
              data={result.scoring}
              defaultOpen={!isExceeded}
              muted={isExceeded}
            />

            {/* ③ Quota */}
            <QuotaSection
              data={result.quota}
              defaultOpen={!isExceeded}
              muted={isExceeded}
            />

            {/* ④ Timeline */}
            <TimelineSection
              data={result.timeline}
              defaultOpen={!isExceeded}
              muted={isExceeded}
            />

            {/* ⑤ AI Summary */}
            <AiSummarySection sanitizedHtml={result.aiSummary} />

            {/* ⑥ What-if (exceeded only) */}
            {result.whatIf && <WhatIfSection data={result.whatIf} />}

            {/* Recommendation */}
            <RecommendationBox data={result.recommendation} />

            {/* Disclaimer */}
            <div className="border-t border-border pt-3 text-center text-[10px] text-muted-foreground">
              ⚖ {result.disclaimer}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
