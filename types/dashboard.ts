import type { VisaType, DeadlineType, DeadlineStatus } from "./api";

export type AlertLevel = "critical" | "warning" | "info";
export type DeadlineUrgency = "overdue" | "d7" | "d30" | "safe";

export interface AlertAction {
  readonly label: string;
  readonly href: string;
}

export interface DashboardAlert {
  readonly id: string;
  readonly level: AlertLevel;
  readonly title: string;
  readonly description: string;
  readonly dDay: number | null;
  readonly badgeText: string;
  readonly actions: readonly AlertAction[];
}

export interface VisaDistributionItem {
  readonly type: VisaType;
  readonly count: number;
  readonly percentage: number;
}

export interface InsuranceSummaryItem {
  readonly type: string;
  readonly enrolled: number;
  readonly label: string;
  readonly status: "ok" | "warn";
  readonly statusText: string;
}

export interface ComplianceBreakdownItem {
  readonly label: string;
  readonly score: number;
}

export interface ComplianceScoreData {
  readonly total: number;
  readonly breakdown: readonly ComplianceBreakdownItem[];
}

export interface DashboardDeadline {
  readonly id: string;
  readonly title: string;
  readonly workerName: string;
  readonly visaType: VisaType;
  readonly dDay: number;
  readonly urgency: DeadlineUrgency;
}

export interface DashboardStats {
  readonly totalWorkers: number;
  readonly visaBreakdown: readonly { readonly type: VisaType; readonly count: number }[];
  readonly insuranceRate: number;
  readonly insuranceRateChange: number | null;
  readonly upcomingDeadlines: number;
  readonly deadlineBreakdown: { readonly d7: number; readonly d30: number };
  readonly urgentActions: number;
  readonly urgentBreakdown: { readonly visa: number; readonly insurance: number };
}

export interface DashboardResponse {
  readonly stats: DashboardStats;
  readonly alerts: readonly DashboardAlert[];
  readonly visaDistribution: readonly VisaDistributionItem[];
  readonly insuranceSummary: readonly InsuranceSummaryItem[];
  readonly complianceScore: Readonly<ComplianceScoreData>;
  readonly aiInsight: string;
  readonly upcomingDeadlines: readonly DashboardDeadline[];
}

// ─── BE Raw Response Types ──────────────────────────────────

export interface DashboardRawResponse {
  readonly stats: DashboardRawStats;
  readonly alerts: readonly DashboardRawAlert[];
  readonly visaDistribution: readonly VisaRawDistributionItem[];
  readonly insuranceSummary: readonly InsuranceRawSummaryItem[];
  readonly complianceScore: Readonly<ComplianceRawScoreData>;
  readonly aiInsight: string;
  readonly upcomingDeadlines: readonly DashboardRawDeadline[];
}

export interface DashboardRawStats {
  readonly totalWorkers: number;
  readonly visaBreakdown: readonly { readonly visaType: VisaType; readonly count: number }[];
  readonly insuranceRate: number;
  readonly upcomingDeadlines: number;
  readonly deadlineBreakdown: { readonly d7: number; readonly d30: number };
  readonly urgentActions: number;
  readonly urgentBreakdown: { readonly visa: number; readonly insurance: number };
}

export interface DashboardRawAlert {
  readonly deadlineId: number;
  readonly workerId: number;
  readonly workerName: string;
  readonly deadlineType: DeadlineType;
  readonly status: DeadlineStatus;
  readonly dDay: number;
  readonly dueDate: string;
  readonly description: string;
}

export interface VisaRawDistributionItem {
  readonly visaType: VisaType;
  readonly count: number;
  readonly percentage: number;
}

export interface InsuranceRawSummaryItem {
  readonly insuranceType: string;
  readonly mandatoryCount: number;
  readonly totalWorkers: number;
}

export interface ComplianceRawScoreData {
  readonly total: number;
  readonly breakdown: readonly ComplianceRawBreakdownItem[];
}

export interface ComplianceRawBreakdownItem {
  readonly category: string;
  readonly score: number;
}

export interface DashboardRawDeadline {
  readonly deadlineId: number;
  readonly workerId: number;
  readonly workerName: string;
  readonly visaType: VisaType;
  readonly deadlineType: DeadlineType;
  readonly status: DeadlineStatus;
  readonly dDay: number;
  readonly dueDate: string;
}
