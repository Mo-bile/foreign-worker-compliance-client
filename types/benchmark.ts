import type { SignalColor, DataSource, DataRow } from "./shared";

export type { SignalColor, DataSource, DataRow } from "./shared";

// ─── Score ──────────────────────────────────────────────────
export interface ScoreCategory {
  readonly label: string;
  readonly score: number;
  readonly color: SignalColor;
}

export interface BenchmarkScore {
  readonly total: number;
  readonly grade: string;
  readonly change: number;
  readonly categories: readonly ScoreCategory[];
}

// ─── Quick Actions ──────────────────────────────────────────
export interface QuickActionItem {
  readonly text: string;
  readonly href?: string;
}

export interface QuickActionCard {
  readonly count: number;
  readonly items: readonly QuickActionItem[];
}

export interface QuickActions {
  readonly urgent: QuickActionCard;
  readonly improvement: QuickActionCard;
}

// ─── Benchmark Data Row (extends shared DataRow with color) ─
export interface BenchmarkDataRow extends DataRow {
  readonly color?: SignalColor;
}

// ─── Analysis Base ──────────────────────────────────────────
export interface AnalysisBase {
  readonly title: string;
  readonly icon: string;
  readonly badge: { readonly text: string; readonly color: SignalColor };
  readonly dataRows: readonly BenchmarkDataRow[];
  readonly dataSources: readonly DataSource[];
  readonly aiInsight: string;
}

// ─── Wage Analysis ──────────────────────────────────────────
export interface WageAnalysis extends AnalysisBase {
  readonly percentile: number;
  readonly medianPercentile: number;
  readonly percentileLabel: string;
}

// ─── Attrition Analysis ─────────────────────────────────────
export type RiskLevel = "low" | "caution" | "moderate" | "high";

export interface AttritionAnalysis extends AnalysisBase {
  readonly riskLevel: RiskLevel;
}

// ─── Dependency Analysis ────────────────────────────────────
export interface DependencyAnalysis extends AnalysisBase {
  readonly companyRatio: number;
  readonly industryRatio: number;
  readonly companyCount: number;
  readonly totalCount: number;
}

// ─── Trend Analysis ─────────────────────────────────────────
export interface TrendMonth {
  readonly month: string;
  readonly total: number;
  readonly insurance: number;
  readonly deadline: number;
  readonly wage: number;
}

export interface TrendAnalysis extends AnalysisBase {
  readonly months: readonly TrendMonth[];
}

// ─── Response ───────────────────────────────────────────────
export interface BenchmarkResponse {
  readonly id: string;
  readonly reportPeriod: string;
  readonly analyzedAt: string;
  readonly dataSourceCount: number;
  readonly score: BenchmarkScore;
  readonly aiSummary: string;
  readonly quickActions: QuickActions;
  readonly wage: WageAnalysis;
  readonly attrition: AttritionAnalysis;
  readonly dependency: DependencyAnalysis;
  readonly trend: TrendAnalysis;
}
