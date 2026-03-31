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
  deductionScore: z.number().int().min(0),
});

export type SimulationRequest = z.infer<typeof simulationRequestSchema>;

// ─── Verdict (이진) ──────────────────────────────────────────────
export type SimulationVerdict = "WITHIN_QUOTA" | "EXCEEDED";

// ─── BE Response Types (새 도메인) ───────────────────────────────

export interface AdditionalBonus {
  readonly reason: string;
  readonly additionalCount: number;
}

export type WhatIfFeasibility = "IMPOSSIBLE" | "INSUFFICIENT" | "POSSIBLE" | "SURPLUS";

export interface WhatIfScenario {
  readonly domesticInsuredCount: number;
  readonly delta: number;
  readonly newLimit: number;
  readonly remainingCapacity: number;
  readonly feasibility: WhatIfFeasibility;
}

export interface EmploymentLimitResponse {
  readonly domesticInsuredCount: number;
  readonly baseLimit: number;
  readonly additionalBonuses: readonly AdditionalBonus[];
  readonly totalLimit: number;
  readonly currentForeignWorkerCount: number;
  readonly remainingCapacity: number;
  readonly limitExceeded: boolean;
  readonly whatIfScenarios: readonly WhatIfScenario[];
}

export interface ScoringBonusItem {
  readonly code: string;
  readonly label: string;
  readonly score: number;
  readonly applied: boolean;
}

export interface ScoringResponse {
  readonly appliedBonusItems: readonly ScoringBonusItem[];
  readonly availableBonusItems: readonly ScoringBonusItem[];
  readonly totalBonusScore: number;
  readonly estimatedScore: number;
  readonly maxPossibleScore: number;
}

export interface RoundHistoryItem {
  readonly round: string;
  readonly year: number;
  readonly allocation: number;
  readonly industryAllocation: number;
  readonly competitionRate: number | null;
}

export interface QuotaStatusResponse {
  readonly industry: string;
  readonly currentRound: string;
  readonly roundAllocation: number;
  readonly industryAllocation: number;
  readonly roundHistory: readonly RoundHistoryItem[];
  readonly industryTrend: string;
}

export interface TimelineStep {
  readonly step: number;
  readonly title: string;
  readonly description: string;
  readonly duration: string;
}

export interface NationalityDuration {
  readonly nationality: string;
  readonly flag: string;
  readonly avgMonths: number;
  readonly note: string;
}

export interface TimelineResponse {
  readonly preferredNationality: string | null;
  readonly estimatedMonths: number;
  readonly steps: readonly TimelineStep[];
  readonly nationalityComparison: readonly NationalityDuration[];
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
  readonly employmentLimit: EmploymentLimitResponse;
  readonly scoring: ScoringResponse;
  readonly quotaStatus: QuotaStatusResponse;
  readonly timeline: TimelineResponse;
  readonly aiInsights: AiInsightsResponse;
  readonly createdAt: string;
}

// ─── FE Display Types ────────────────────────────────────────────

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
  readonly additionalBonuses: readonly AdditionalBonus[];
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
  readonly tableRows: readonly ScoringTableRow[];
  readonly improvement: ScoringImprovementData | null;
}

export interface QuotaRoundRow {
  readonly round: string;
  readonly allocation: string;
  readonly industryAllocation: string;
  readonly competitionRate: string;
  readonly isCurrent: boolean;
  readonly isFuture: boolean;
}

export interface QuotaDisplayData {
  readonly currentRound: string;
  readonly roundAllocation: string;
  readonly industryAllocationText: string;
  readonly roundRows: readonly QuotaRoundRow[];
  readonly industryTrend: string;
}

export interface TimelineDisplayData {
  readonly estimatedMonths: number;
  readonly steps: readonly TimelineStep[];
  readonly nationalityComparison: readonly NationalityDuration[];
  readonly preferredNationality: string | null;
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

export interface SimulationResponse {
  readonly id: string;
  readonly verdict: VerdictDisplayData;
  readonly scoring: ScoringDisplayData;
  readonly quota: QuotaDisplayData;
  readonly timeline: TimelineDisplayData;
  readonly aiSummary: string;
  readonly whatIf: WhatIfDisplayData | null;
  readonly recommendation: RecommendationDisplayData;
  readonly disclaimer: string;
  readonly createdAt: string;
}
