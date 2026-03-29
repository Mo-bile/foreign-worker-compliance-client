import { z } from "zod";
import type { Nationality } from "./api";
import type { SignalColor, DataSource, DataRow } from "./shared";

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

// ─── Desired Timings ─────────────────────────────────────────────
export const DESIRED_TIMINGS = ["2026_H1", "2026_H2", "2027_H1", "2027_H2"] as const;

export const DESIRED_TIMING_LABELS: Record<(typeof DESIRED_TIMINGS)[number], string> = {
  "2026_H1": "2026년 상반기",
  "2026_H2": "2026년 하반기",
  "2027_H1": "2027년 상반기",
  "2027_H2": "2027년 하반기",
};

// ─── Zod Schema ───────────────────────────────────────────────────
export const simulationRequestSchema = z.object({
  desiredWorkers: z.number().int().min(1).max(50),
  preferredNationality: z.enum(E9_NATIONALITIES as unknown as [string, ...string[]]).optional(),
  desiredTiming: z.enum(DESIRED_TIMINGS),
});

export type SimulationRequest = z.infer<typeof simulationRequestSchema>;

// ─── Type Unions ──────────────────────────────────────────────────
export type SimulationVerdict = "HIGH" | "MEDIUM" | "LOW";
export type ProgressLevel = "low" | "mid" | "high";

// ─── Shared Types ─────────────────────────────────────────────────
export type { SignalColor, DataSource, DataRow } from "./shared";

// ─── Interfaces ───────────────────────────────────────────────────
export interface SimStatItem {
  readonly label: string;
  readonly value: string;
  readonly subText: string;
  readonly color: SignalColor;
}

export interface ProgressData {
  readonly label: string;
  readonly value: number;
  readonly level: ProgressLevel;
}

export interface Badge {
  readonly text: string;
  readonly color: SignalColor;
}

export interface AnalysisSection {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly badge: Badge;
  readonly dataRows: readonly DataRow[];
  readonly progress: ProgressData | null;
  readonly dataSources: readonly DataSource[];
  readonly aiInsight: string;
}

export interface RecommendationItem {
  readonly text: string;
  readonly linkText?: string;
  readonly href?: string;
}

export interface NationalityAnalysis {
  readonly nationality: Nationality;
  readonly percentage: number;
  readonly avgPercentage: number;
  readonly trend: "up" | "down" | "stable";
}

export interface SimulationResponse {
  readonly id: string;
  readonly verdict: SimulationVerdict;
  readonly verdictText: string;
  readonly summary: string;
  readonly analyzedAt: string;
  readonly dataSourceCount: number;
  readonly stats: {
    readonly allocation: SimStatItem;
    readonly competition: SimStatItem;
    readonly duration: SimStatItem;
  };
  readonly analyses: readonly AnalysisSection[];
  readonly nationality: NationalityAnalysis | null;
  readonly recommendations: readonly RecommendationItem[];
}

// ─── BE Response Types ───────────────────────────────────────────
export interface QuotaAnalysis {
  readonly industryQuota: number;
  readonly currentAllocated: number;
  readonly remainingQuota: number;
  readonly utilizationRate: number;
  readonly quotaSufficient: boolean;
}

export interface CompetitionAnalysis {
  readonly regionApplicants: number;
  readonly densityRank: number;
  readonly avgApplicationRate: number;
  readonly competitionLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface NationalityAnalysisResult {
  readonly nationality: string;
  readonly industryShareRate: number;
  readonly requestedShareRate: number;
  readonly available: boolean;
}

export interface SimulationResultResponse {
  readonly id: string;
  readonly companyId: number;
  readonly desiredWorkers: number;
  readonly desiredTiming: string;
  readonly preferredNationality: string | null;
  readonly quotaAnalysis: QuotaAnalysis;
  readonly competitionAnalysis: CompetitionAnalysis;
  readonly nationalityAnalysis: NationalityAnalysisResult | null;
  readonly aiReport: string;
  readonly createdAt: string;
}
