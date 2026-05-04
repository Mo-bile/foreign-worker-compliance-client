import { z } from "zod";
import type { Nationality } from "./api";

// ─── E9 Eligible Nationalities ────────────────────────────────────
export const E9_NATIONALITIES = [
  "VIETNAM",
  "PHILIPPINES",
  "INDONESIA",
  "CAMBODIA",
  "MYANMAR",
  "NEPAL",
  "BANGLADESH",
  "PAKISTAN",
  "THAILAND",
  "SRI_LANKA",
  "MONGOLIA",
  "CHINA",
  "UZBEKISTAN",
  "KYRGYZSTAN",
  "TAJIKISTAN",
  "KAZAKHSTAN",
] as const satisfies readonly Nationality[];

// ─── Desired Timings (차수 기반) ─────────────────────────────────
export const DESIRED_TIMINGS = ["2026_Q2", "2026_Q3", "2026_Q4"] as const;

export const DESIRED_TIMING_LABELS: Record<(typeof DESIRED_TIMINGS)[number], string> = {
  "2026_Q2": "2026년 2차 (4~6월)",
  "2026_Q3": "2026년 3차 (7~9월)",
  "2026_Q4": "2026년 4차 (10~12월)",
};

// ─── Zod Schema (Request) ────────────────────────────────────────
export const simulationRequestSchema = z.object({
  desiredWorkers: z.number().int().min(1).max(50),
  preferredNationality: z.enum(E9_NATIONALITIES as unknown as [string, ...string[]]).optional(),
  desiredTiming: z.enum(DESIRED_TIMINGS),
  domesticInsuredCount: z.number().int().min(1),
  appliedScoringCodes: z.array(z.string()),
});

export type SimulationRequest = z.infer<typeof simulationRequestSchema>;

// ─── Verdict (이진) ──────────────────────────────────────────────
export type SimulationVerdict = "WITHIN_QUOTA" | "EXCEEDED";

// ─── BE Response Types (실제 API shape) ──────────────────────────

export interface AdditionalBonusBE {
  readonly reason: string;
  readonly ratePercent: number;
  readonly cappedByDomesticCount: boolean;
}

export type WhatIfFeasibility = "IMPOSSIBLE" | "INSUFFICIENT" | "POSSIBLE" | "SURPLUS";

export interface WhatIfScenarioBE {
  readonly additionalDomesticCount: number;
  readonly newDomesticTotal: number;
  readonly newBaseLimit: number;
  readonly newBaseLimitAfterCap: number;
  readonly newTotalLimit: number;
  readonly newRemainingCapacity: number;
  readonly feasibility: WhatIfFeasibility;
}

export interface EmploymentLimitAnalysis {
  readonly domesticInsuredCount: number;
  readonly baseLimit: number;
  readonly doubleCap: number | null;
  readonly baseLimitAfterCap: number;
  readonly additionalBonuses: readonly AdditionalBonusBE[];
  readonly additionalCount: number;
  readonly totalLimit: number;
  readonly cappedByDomesticCount: boolean;
  readonly currentForeignWorkerCount: number;
  readonly remainingCapacity: number;
  readonly limitExceeded: boolean;
  readonly whatIfScenarios: readonly WhatIfScenarioBE[];
}

export interface ScoringItemBE {
  readonly code: string;
  readonly displayName: string;
  readonly points: number;
  readonly applied: boolean;
}

// 호환성 alias (점진 마이그레이션, 기존 사용처 영향 0)
export type ScoringBonusItemBE = ScoringItemBE;

// PR-EF D36: BE가 워커 lifecycle 데이터(recentYearEmployerFaultEndCount 등)에서 자동 매핑한 감점 후보
export interface AutoSuggestedDeduction {
  readonly code: string;          // "LABOR_VIOLATION_MODERATE"
  readonly displayName: string;   // "노동관계법 위반(폭행폭언·임금체불)"
  readonly points: number;        // 6 (감점 절댓값)
  readonly reason: string;        // "최근 1년 사업주 귀책 사업장 변경 1명"
  readonly triggerCount: number;  // 1
}

export interface ScoringAnalysis {
  readonly appliedBonusItems: readonly ScoringItemBE[];
  readonly availableBonusItems: readonly ScoringItemBE[];
  readonly appliedDeductionItems: readonly ScoringItemBE[];      // PR-ε 신규
  readonly availableDeductionItems: readonly ScoringItemBE[];    // PR-ε 신규
  readonly autoSuggestedDeductions: readonly AutoSuggestedDeduction[]; // PR-ε 신규 (D36)
  readonly totalBonusScore: number;
  readonly totalDeductionScore: number;
  readonly estimatedScore: number;
  readonly maxPossibleScore: number;
}

export interface QuotaHistoryItem {
  readonly year: number;
  readonly quotaCount: number;
  readonly source: string;
}

export interface QuotaStatusResponseBE {
  readonly industry: string;
  readonly currentYearQuota: number;
  readonly recentHistory: readonly QuotaHistoryItem[];
}

export interface TimelineStepBE {
  readonly stepName: string;
  readonly estimatedDays: number;
  readonly description: string;
  readonly source?: string;
}

export interface TimelineEstimateBE {
  readonly preferredNationality: string | null;
  readonly estimatedMonths: number;
  readonly steps: readonly TimelineStepBE[];
}

export interface AiInsightsResponse {
  readonly overallVerdict: string;
  readonly limitInsight: string;
  readonly scoringInsight: string;
  readonly quotaInsight: string;
  readonly timelineInsight: string;
  readonly actionItems: readonly string[];
  readonly disclaimer: string;
}

export interface SimulationResultResponse {
  readonly id: number;
  readonly companyId: number;
  readonly desiredWorkers: number;
  readonly desiredTiming: string;
  readonly preferredNationality: string | null;
  readonly domesticInsuredCount: number;
  readonly employmentLimitAnalysis: EmploymentLimitAnalysis;
  readonly scoringAnalysis: ScoringAnalysis;
  readonly quotaStatus: QuotaStatusResponseBE;
  readonly timelineEstimate: TimelineEstimateBE;
  readonly aiInsights: AiInsightsResponse;
  readonly createdAt: string;
}

// ─── FE Display Types ────────────────────────────────────────────

export interface AdditionalBonusDisplay {
  readonly reason: string;
  readonly additionalCount: number;
}

export interface VerdictDisplayData {
  readonly verdict: SimulationVerdict;
  readonly title: string;
  readonly limitText: string;
  readonly currentCount: number;
  readonly totalLimit: number;
  readonly remainingCapacity: number;
  readonly usagePercent: number;
  readonly progressLevel: "low" | "mid" | "high" | "critical";
  readonly summaryText: string;
  readonly additionalBonuses: readonly AdditionalBonusDisplay[];
}

export interface ScoringTableRow {
  readonly label: string;
  readonly score: string;
  readonly status: string;
  readonly isDeduction: boolean;
}

export interface ScoringImprovementData {
  readonly currentScore: number;
  readonly currentPercentile: string;
  readonly improvedScore: number;
  readonly improvedPercentile: string;
  readonly improvementLabel: string;
  readonly improvementDescription: string;
}

export interface ScoringDisplayData {
  readonly estimatedScore: number;
  readonly percentileText: string;
  readonly percentileDisclaimer: string;
  readonly tableRows: readonly ScoringTableRow[];
  readonly improvement: ScoringImprovementData | null;
}

export interface QuotaYearRow {
  readonly year: number;
  readonly quotaCount: string;
  readonly source: string;
  readonly isCurrent: boolean;
}

export interface QuotaDisplayData {
  readonly industry: string;
  readonly currentYearQuota: string;
  readonly yearRows: readonly QuotaYearRow[];
}

export interface TimelineStepDisplay {
  readonly title: string;
  readonly duration: string;
  readonly description: string;
  readonly source: string | null;
}

export interface TimelineDisplayData {
  readonly estimatedMonths: number;
  readonly preferredNationality: string | null;
  readonly steps: readonly TimelineStepDisplay[];
}

export interface WhatIfRow {
  readonly domesticInsuredCount: number;
  readonly delta: string;
  readonly newLimit: number;
  readonly remainingCapacity: number;
  readonly feasibility: WhatIfFeasibility;
  readonly feasibilityLabel: string;
}

export interface WhatIfDisplayData {
  readonly rows: readonly WhatIfRow[];
  readonly minimumConditionText: string;
}

export interface RecommendationItem {
  readonly text: string;
  readonly linkText?: string;
  readonly href?: string;
}

export interface RecommendationDisplayData {
  readonly variant: "green" | "yellow";
  readonly title: string;
  readonly items: readonly RecommendationItem[];
}

export interface AutoSuggestedDeductionDisplay {
  readonly code: string;
  readonly displayName: string;
  readonly pointsLabel: string;        // "-6점" (사전 포맷)
  readonly reason: string;
  readonly triggerCountLabel: string;  // "관련 워커 1명"
}

export interface SimulationResponse {
  readonly id: string;
  readonly verdict: VerdictDisplayData;
  readonly scoring: ScoringDisplayData;
  readonly autoSuggested: readonly AutoSuggestedDeductionDisplay[];        // PR-ε 신규
  readonly currentAppliedScoringCodes: readonly string[];                  // PR-ε 신규 (재시뮬 누적용)
  readonly quota: QuotaDisplayData;
  readonly timeline: TimelineDisplayData;
  readonly aiSummary: string;
  readonly whatIf: WhatIfDisplayData | null;
  readonly recommendation: RecommendationDisplayData;
  readonly disclaimer: string;
  readonly createdAt: string;
}
