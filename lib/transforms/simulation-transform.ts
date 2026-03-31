import DOMPurify from "isomorphic-dompurify";
import type {
  SimulationResultResponse,
  SimulationResponse,
  SimulationVerdict,
  VerdictDisplayData,
  ScoringDisplayData,
  ScoringTableRow,
  ScoringImprovementData,
  QuotaDisplayData,
  QuotaRoundRow,
  TimelineDisplayData,
  WhatIfDisplayData,
  WhatIfRow,
  WhatIfFeasibility,
  RecommendationDisplayData,
  RecommendationItem,
  EmploymentLimitResponse,
  ScoringResponse,
  QuotaStatusResponse,
  TimelineResponse,
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

const BASE_SCORE = 60;

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

// ─── Verdict ─────────────────────────────────────────────────────

function buildVerdict(
  limit: EmploymentLimitResponse,
  desiredWorkers: number,
): VerdictDisplayData {
  const verdict: SimulationVerdict = limit.limitExceeded ? "EXCEEDED" : "WITHIN_QUOTA";
  const usagePercent = limit.totalLimit > 0
    ? Math.round((limit.currentForeignWorkerCount / limit.totalLimit) * 100)
    : 0;

  const title = limit.limitExceeded ? "추가 채용 불가" : "추가 채용 가능";

  const summaryText = limit.limitExceeded
    ? `현재 ${limit.currentForeignWorkerCount}명 고용 중으로 잔여 한도가 없습니다. 희망 인원 ${desiredWorkers}명은 한도를 초과합니다.`
    : `희망 인원 ${desiredWorkers}명은 잔여 한도(${limit.remainingCapacity}명) 이내입니다.${
        limit.additionalBonuses.length > 0
          ? ` ${limit.additionalBonuses.map((b) => b.reason).join(", ")}으로 한도가 상향 적용되었습니다.`
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
    additionalBonuses: limit.additionalBonuses,
  };
}

// ─── Scoring ─────────────────────────────────────────────────────

function buildScoringRows(
  scoring: ScoringResponse,
  deductionCodes: ReadonlySet<string>,
): readonly ScoringTableRow[] {
  const rows: ScoringTableRow[] = [];

  rows.push({
    label: "기본 점수 (사업장 규모·업종)",
    score: `${BASE_SCORE}점`,
    status: "—",
    isDeduction: false,
  });

  for (const item of scoring.appliedBonusItems) {
    const isDeduction = deductionCodes.has(item.code);
    rows.push({
      label: item.label,
      score: isDeduction ? `-${item.score}점` : `+${item.score}점`,
      status: "✓",
      isDeduction,
    });
  }

  for (const item of scoring.availableBonusItems) {
    const isDeduction = deductionCodes.has(item.code);
    rows.push({
      label: item.label,
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

function buildScoringImprovement(scoring: ScoringResponse): ScoringImprovementData | null {
  const bestAvailable = scoring.availableBonusItems.reduce<typeof scoring.availableBonusItems[number] | null>(
    (best, item) => (best === null || item.score > best.score ? item : best),
    null,
  );

  if (bestAvailable === null) return null;

  const improvedScore = scoring.estimatedScore + bestAvailable.score;
  return {
    currentScore: scoring.estimatedScore,
    currentPercentile: estimatePercentile(scoring.estimatedScore),
    improvedScore,
    improvedPercentile: estimatePercentile(improvedScore),
    improvementLabel: `${bestAvailable.label} 시`,
    improvementDescription: `${bestAvailable.label} 인증을 받으면 +${bestAvailable.score}점으로 배정 가능성이 크게 향상됩니다. 인증 기준은 관할 고용센터에 문의하세요.`,
  };
}

function buildScoring(
  scoring: ScoringResponse,
  deductionCodes: ReadonlySet<string>,
): ScoringDisplayData {
  return {
    estimatedScore: scoring.estimatedScore,
    percentileText: estimatePercentile(scoring.estimatedScore),
    tableRows: buildScoringRows(scoring, deductionCodes),
    improvement: buildScoringImprovement(scoring),
  };
}

// ─── Quota ───────────────────────────────────────────────────────

function buildQuota(quota: QuotaStatusResponse): QuotaDisplayData {
  const industryPercent = quota.roundAllocation > 0
    ? Math.round((quota.industryAllocation / quota.roundAllocation) * 100)
    : 0;

  const currentYear = new Date().getFullYear();

  const roundRows: QuotaRoundRow[] = quota.roundHistory.map((r) => {
    const isCurrent = r.round === quota.currentRound;
    const isFuture = r.year > currentYear
      || (r.year === currentYear && !isCurrent && r.allocation === 0);
    return {
      round: r.round,
      allocation: isFuture ? "미공개" : `${formatNumber(r.allocation)}명`,
      industryAllocation: isFuture
        ? "—"
        : isCurrent
          ? `≈${formatNumber(r.industryAllocation)}명`
          : `${formatNumber(r.industryAllocation)}명`,
      competitionRate: r.competitionRate !== null ? `${r.competitionRate}:1` : "—",
      isCurrent,
      isFuture,
    };
  });

  return {
    currentRound: quota.currentRound,
    roundAllocation: `${formatNumber(quota.roundAllocation)}명`,
    industryAllocationText: `약 ${industryPercent}% (≈${formatNumber(quota.industryAllocation)}명)`,
    roundRows,
    industryTrend: quota.industryTrend,
  };
}

// ─── Timeline ────────────────────────────────────────────────────

function buildTimeline(timeline: TimelineResponse): TimelineDisplayData {
  return {
    estimatedMonths: timeline.estimatedMonths,
    steps: timeline.steps,
    nationalityComparison: timeline.nationalityComparison,
    preferredNationality: timeline.preferredNationality,
  };
}

// ─── What-if ─────────────────────────────────────────────────────

function buildWhatIf(limit: EmploymentLimitResponse): WhatIfDisplayData | null {
  if (!limit.limitExceeded) return null;

  if (limit.whatIfScenarios.length === 0) {
    console.warn(
      "[buildWhatIf] limitExceeded=true but whatIfScenarios is empty — backend may have returned incomplete data",
    );
    return null;
  }

  const rows: WhatIfRow[] = limit.whatIfScenarios.map((s) => ({
    domesticInsuredCount: s.domesticInsuredCount,
    delta: s.delta === 0 ? "현재" : `+${s.delta}명`,
    newLimit: s.newLimit,
    remainingCapacity: s.remainingCapacity,
    feasibility: s.feasibility,
    feasibilityLabel: FEASIBILITY_LABELS[s.feasibility],
  }));

  const minPossible = limit.whatIfScenarios.find(
    (s) => s.delta > 0 && (s.feasibility === "POSSIBLE" || s.feasibility === "SURPLUS"),
  );

  const minimumConditionText = minPossible
    ? `내국인 피보험자를 현재 ${limit.domesticInsuredCount}명에서 ${minPossible.domesticInsuredCount}명(+${minPossible.delta}명)으로 늘리면 추가 채용이 가능해집니다.`
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

  const items: RecommendationItem[] = limitExceeded
    ? insights.actionItems.map((text) => ({ text }))
    : [
        {
          text: "내국인 구인노력 14일 이행",
          linkText: "워크넷 바로가기",
          href: "https://www.work.go.kr",
        },
        {
          text: "고용허가 신청 구비서류 준비",
          linkText: "서류목록 다운로드",
          href: "https://www.eps.go.kr",
        },
        {
          text: "관할 고용센터 방문 또는 온라인 신청",
          linkText: "고용센터 찾기",
          href: "https://www.work.go.kr/center",
        },
      ];

  if (!limitExceeded && items.length === 0) {
    items.push({
      text: "내국인 구인노력 의무기간 14일을 우선 이행하세요",
      linkText: "워크넷 바로가기",
      href: "https://www.work.go.kr",
    });
  }

  return { variant, title, items };
}

// ─── Main Transform ──────────────────────────────────────────────

export function transformSimulationResult(
  raw: SimulationResultResponse,
  deductionCodes: ReadonlySet<string> = new Set(),
): SimulationResponse {
  const { employmentLimit, scoring, quotaStatus, timeline, aiInsights } = raw;

  return {
    id: String(raw.id),
    verdict: buildVerdict(employmentLimit, raw.desiredWorkers),
    scoring: buildScoring(scoring, deductionCodes),
    quota: buildQuota(quotaStatus),
    timeline: buildTimeline(timeline),
    aiSummary: sanitize(aiInsights.overallVerdict),
    whatIf: buildWhatIf(employmentLimit),
    recommendation: buildRecommendation(aiInsights, employmentLimit.limitExceeded),
    disclaimer: aiInsights.disclaimer,
    createdAt: raw.createdAt,
  };
}
