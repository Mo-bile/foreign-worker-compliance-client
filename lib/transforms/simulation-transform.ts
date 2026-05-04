import DOMPurify from "isomorphic-dompurify";
import type {
  SimulationResultResponse,
  SimulationResponse,
  AutoSuggestedDeduction,
  AutoSuggestedDeductionDisplay,
  SimulationVerdict,
  VerdictDisplayData,
  AdditionalBonusDisplay,
  ScoringDisplayData,
  ScoringTableRow,
  ScoringImprovementData,
  QuotaDisplayData,
  QuotaYearRow,
  TimelineDisplayData,
  TimelineStepDisplay,
  WhatIfDisplayData,
  WhatIfRow,
  WhatIfFeasibility,
  RecommendationDisplayData,
  RecommendationItem,
  EmploymentLimitAnalysis,
  ScoringAnalysis,
  QuotaStatusResponseBE,
  TimelineEstimateBE,
  AiInsightsResponse,
} from "@/types/simulator";

// ─── Constants ───────────────────────────────────────────────────

const SANITIZE_OPTIONS = { ALLOWED_TAGS: ["strong", "em", "br"] };

const FEASIBILITY_LABELS: Record<WhatIfFeasibility, string> = {
  IMPOSSIBLE: "불가",
  INSUFFICIENT: "부족",
  POSSIBLE: "가능",
  SURPLUS: "여유",
};

const PERCENTILE_DISCLAIMER = "참고용 추정치, 실제와 다를 수 있음";

const RECOMMENDATION_URLS = {
  WORKNET: "https://www.work.go.kr",
  EPS: "https://www.eps.go.kr",
  WORKNET_CENTER: "https://www.work.go.kr/center",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function deriveProgressLevel(percent: number): "low" | "mid" | "high" | "critical" {
  if (percent >= 100) return "critical";
  if (percent >= 80) return "high";
  if (percent >= 50) return "mid";
  return "low";
}

function estimatePercentile(score: number): string {
  if (score >= 80) return "상위 ~10%";
  if (score >= 73) return "상위 ~20%";
  if (score >= 65) return "상위 ~30%";
  if (score >= 58) return "상위 ~50%";
  return "상위 ~70%";
}

function formatDays(estimatedDays: number): string {
  if (estimatedDays >= 30) return `약 ${Math.round(estimatedDays / 30)}개월`;
  return `약 ${estimatedDays}일`;
}

// ─── Verdict ─────────────────────────────────────────────────────

function buildVerdict(limit: EmploymentLimitAnalysis, desiredWorkers: number): VerdictDisplayData {
  const verdict: SimulationVerdict = limit.limitExceeded ? "EXCEEDED" : "WITHIN_QUOTA";
  const usagePercent =
    limit.totalLimit > 0
      ? Math.round((limit.currentForeignWorkerCount / limit.totalLimit) * 100)
      : limit.currentForeignWorkerCount > 0
        ? 100
        : 0;

  const title = limit.limitExceeded ? "추가 채용 불가" : "추가 채용 가능";

  const additionalBonuses: readonly AdditionalBonusDisplay[] = limit.additionalBonuses.map((b) => ({
    reason: b.reason,
    additionalCount: Number.isFinite(b.ratePercent)
      ? Math.floor((limit.baseLimitAfterCap * b.ratePercent) / 100)
      : 0,
  }));

  const summaryText = limit.limitExceeded
    ? `현재 ${limit.currentForeignWorkerCount}명 고용 중으로 잔여 한도가 없습니다. 희망 인원 ${desiredWorkers}명은 한도를 초과합니다.`
    : `희망 인원 ${desiredWorkers}명은 잔여 한도(${limit.remainingCapacity}명) 이내입니다.${
        additionalBonuses.length > 0
          ? ` ${additionalBonuses.map((b) => b.reason).join(", ")}으로 한도가 상향 적용되었습니다.`
          : ""
      }`;

  return {
    verdict,
    title,
    limitText: `귀사의 고용 한도: 외국인 ${limit.totalLimit}명 (내국인 ${limit.domesticInsuredCount}명 기준)`,
    currentCount: limit.currentForeignWorkerCount,
    totalLimit: limit.totalLimit,
    remainingCapacity: limit.remainingCapacity,
    usagePercent,
    progressLevel: deriveProgressLevel(usagePercent),
    summaryText,
    additionalBonuses,
  };
}

// ─── Scoring ─────────────────────────────────────────────────────

function buildScoringRows(
  scoring: ScoringAnalysis,
  deductionCodes: ReadonlySet<string>,
): readonly ScoringTableRow[] {
  const rows: ScoringTableRow[] = [];

  rows.push({
    label: "가점 만점",
    score: `${scoring.maxPossibleScore}점`,
    status: "—",
    isDeduction: false,
  });

  for (const item of scoring.appliedBonusItems) {
    const isDeduction = deductionCodes.has(item.code);
    rows.push({
      label: item.displayName,
      score: isDeduction ? `-${item.points}점` : `+${item.points}점`,
      status: "✓",
      isDeduction,
    });
  }

  for (const item of scoring.availableBonusItems) {
    const isDeduction = deductionCodes.has(item.code);
    rows.push({
      label: item.displayName,
      score: "0점",
      status: "미해당",
      isDeduction,
    });
  }

  rows.push({
    label: "합계",
    score: `${scoring.estimatedScore}점`,
    status: "",
    isDeduction: false,
  });

  return rows;
}

function buildScoringImprovement(
  scoring: ScoringAnalysis,
  deductionCodes: ReadonlySet<string>,
): ScoringImprovementData | null {
  const bonusCandidates = scoring.availableBonusItems.filter(
    (item) => !deductionCodes.has(item.code),
  );

  const bestAvailable = bonusCandidates.reduce<(typeof scoring.availableBonusItems)[number] | null>(
    (best, item) => (best === null || item.points > best.points ? item : best),
    null,
  );

  if (bestAvailable === null) return null;

  const improvedScore = scoring.estimatedScore + bestAvailable.points;
  return {
    currentScore: scoring.estimatedScore,
    currentPercentile: estimatePercentile(scoring.estimatedScore),
    improvedScore,
    improvedPercentile: estimatePercentile(improvedScore),
    improvementLabel: `${bestAvailable.displayName} 시`,
    improvementDescription: `${bestAvailable.displayName} 인증을 받으면 +${bestAvailable.points}점으로 배정 가능성이 크게 향상됩니다. 인증 기준은 관할 고용센터에 문의하세요.`,
  };
}

function buildScoring(
  scoring: ScoringAnalysis,
  deductionCodes: ReadonlySet<string>,
): ScoringDisplayData {
  return {
    estimatedScore: scoring.estimatedScore,
    percentileText: estimatePercentile(scoring.estimatedScore),
    percentileDisclaimer: PERCENTILE_DISCLAIMER,
    tableRows: buildScoringRows(scoring, deductionCodes),
    improvement: buildScoringImprovement(scoring, deductionCodes),
  };
}

// ─── Quota ───────────────────────────────────────────────────────

function buildQuota(
  quota: QuotaStatusResponseBE,
  currentYear: number = new Date().getFullYear(),
): QuotaDisplayData {
  const yearRows: QuotaYearRow[] = quota.recentHistory.map((h) => ({
    year: h.year,
    quotaCount: `${formatNumber(h.quotaCount)}명`,
    source: h.source,
    isCurrent: h.year === currentYear,
  }));

  return {
    industry: quota.industry,
    currentYearQuota: `${formatNumber(quota.currentYearQuota)}명`,
    yearRows,
  };
}

// ─── Timeline ────────────────────────────────────────────────────

function buildTimeline(timeline: TimelineEstimateBE): TimelineDisplayData {
  const steps: readonly TimelineStepDisplay[] = timeline.steps.map((s) => ({
    title: s.stepName,
    duration: formatDays(s.estimatedDays),
    description: s.description,
    source: s.source || null,
  }));

  return {
    estimatedMonths: timeline.estimatedMonths,
    preferredNationality: timeline.preferredNationality,
    steps,
  };
}

// ─── What-if ─────────────────────────────────────────────────────

function buildWhatIf(limit: EmploymentLimitAnalysis): WhatIfDisplayData | null {
  if (!limit.limitExceeded) return null;

  if (limit.whatIfScenarios.length === 0) {
    console.warn(
      "[buildWhatIf] limitExceeded=true but whatIfScenarios is empty — backend may have returned incomplete data",
    );
    return null;
  }

  const rows: WhatIfRow[] = limit.whatIfScenarios.map((s) => ({
    domesticInsuredCount: s.newDomesticTotal,
    delta: s.additionalDomesticCount === 0 ? "현재" : `+${s.additionalDomesticCount}명`,
    newLimit: s.newTotalLimit,
    remainingCapacity: s.newRemainingCapacity,
    feasibility: s.feasibility,
    feasibilityLabel: FEASIBILITY_LABELS[s.feasibility] ?? s.feasibility,
  }));

  const minPossible = limit.whatIfScenarios.find(
    (s) =>
      s.additionalDomesticCount > 0 &&
      (s.feasibility === "POSSIBLE" || s.feasibility === "SURPLUS"),
  );

  const minimumConditionText = minPossible
    ? `내국인 피보험자를 현재 ${limit.domesticInsuredCount}명에서 ${minPossible.newDomesticTotal}명(+${minPossible.additionalDomesticCount}명)으로 늘리면 추가 채용이 가능해집니다.`
    : "현재 시나리오에서는 추가 채용이 어렵습니다.";

  return { rows, minimumConditionText };
}

// ─── Recommendations ─────────────────────────────────────────────

function buildRecommendation(
  insights: AiInsightsResponse,
  limitExceeded: boolean,
): RecommendationDisplayData {
  const variant = limitExceeded ? "yellow" : "green";
  const title = limitExceeded ? "대안 조치" : "다음 단계 안내";

  const items: readonly RecommendationItem[] = limitExceeded
    ? insights.actionItems.length > 0
      ? insights.actionItems.map((text) => ({ text }))
      : [{ text: "관할 고용센터에 문의하여 대안을 확인하세요." }]
    : [
        {
          text: "내국인 구인노력 14일 이행",
          linkText: "워크넷 바로가기",
          href: RECOMMENDATION_URLS.WORKNET,
        },
        {
          text: "고용허가 신청 구비서류 준비",
          linkText: "서류목록 다운로드",
          href: RECOMMENDATION_URLS.EPS,
        },
        {
          text: "관할 고용센터 방문 또는 온라인 신청",
          linkText: "고용센터 찾기",
          href: RECOMMENDATION_URLS.WORKNET_CENTER,
        },
      ];

  return { variant, title, items };
}

// ─── Main Transform ──────────────────────────────────────────────

function transformAutoSuggestedDeductions(
  items: readonly AutoSuggestedDeduction[],
): readonly AutoSuggestedDeductionDisplay[] {
  return items.map((item) => ({
    code: item.code,
    displayName: item.displayName,
    pointsLabel: `-${item.points}점`,
    reason: item.reason,
    triggerCountLabel: `관련 워커 ${item.triggerCount}명`,
  }));
}

function collectAppliedScoringCodes(scoringAnalysis: ScoringAnalysis): readonly string[] {
  return [
    ...scoringAnalysis.appliedBonusItems.filter((i) => i.applied).map((i) => i.code),
    ...scoringAnalysis.appliedDeductionItems.filter((i) => i.applied).map((i) => i.code),
  ];
}

export function transformSimulationResult(
  raw: SimulationResultResponse,
  deductionCodes: ReadonlySet<string> = new Set(),
): SimulationResponse {
  const { employmentLimitAnalysis, scoringAnalysis, quotaStatus, timelineEstimate, aiInsights } =
    raw;

  return {
    id: String(raw.id),
    verdict: buildVerdict(employmentLimitAnalysis, raw.desiredWorkers),
    scoring: buildScoring(scoringAnalysis, deductionCodes),
    autoSuggested: transformAutoSuggestedDeductions(
      raw.scoringAnalysis.autoSuggestedDeductions,
    ),
    currentAppliedScoringCodes: collectAppliedScoringCodes(raw.scoringAnalysis),
    quota: buildQuota(quotaStatus),
    timeline: buildTimeline(timelineEstimate),
    aiSummary: sanitize(aiInsights.overallVerdict),
    whatIf: buildWhatIf(employmentLimitAnalysis),
    recommendation: buildRecommendation(aiInsights, employmentLimitAnalysis.limitExceeded),
    disclaimer: aiInsights.disclaimer,
    createdAt: raw.createdAt,
  };
}
