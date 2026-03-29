import type {
  DashboardRawResponse,
  DashboardRawAlert,
  InsuranceRawSummaryItem,
  ComplianceRawBreakdownItem,
  DashboardRawDeadline,
  VisaRawDistributionItem,
  DashboardResponse,
  DashboardAlert,
  AlertLevel,
  InsuranceSummaryItem,
  ComplianceBreakdownItem,
  DashboardDeadline,
  DeadlineUrgency,
  AlertAction,
  VisaDistributionItem,
} from "@/types/dashboard";
import type { DeadlineType } from "@/types/api";
import { DEADLINE_TYPE_LABELS } from "@/types/api";

// ─── Constants ───────────────────────────────────────────────────

const STATUS_TO_LEVEL: Record<string, AlertLevel> = {
  OVERDUE: "critical",
  URGENT: "warning",
  APPROACHING: "info",
};

const STATUS_TO_URGENCY: Record<string, DeadlineUrgency> = {
  OVERDUE: "overdue",
  URGENT: "d7",
  APPROACHING: "d30",
  PENDING: "safe",
};

const ALERT_TITLE_MAP: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료 임박",
  INSURANCE_ENROLLMENT: "보험 가입 필요",
  CONTRACT_RENEWAL: "근로계약 갱신",
  CHANGE_REPORT: "고용변동 신고",
};

const INSURANCE_LABEL_MAP: Record<string, string> = {
  NATIONAL_PENSION: "국민연금",
  HEALTH_INSURANCE: "건강보험",
  EMPLOYMENT_INSURANCE: "고용보험",
  INDUSTRIAL_ACCIDENT: "산재보험",
};

const COMPLIANCE_CATEGORY_LABEL_MAP: Record<string, string> = {
  INSURANCE: "보험 가입",
  DEADLINE: "데드라인 준수",
  WAGE: "임금 경쟁력",
};

// ─── Helpers ─────────────────────────────────────────────────────

function formatBadgeText(dDay: number): string {
  if (dDay > 0) return `D+${dDay}`;
  if (dDay === 0) return "D-0";
  return `D${dDay}`;
}

function buildAlertActions(workerId: number, deadlineType: DeadlineType): readonly AlertAction[] {
  const workerHref = `/workers/${workerId}`;

  switch (deadlineType) {
    case "VISA_EXPIRY":
      return [
        { label: "비자 연장 신청", href: workerHref },
        { label: "근로자 상세", href: workerHref },
      ];
    case "INSURANCE_ENROLLMENT":
      return [
        { label: "조치하기", href: workerHref },
        { label: "근로자 상세", href: workerHref },
      ];
    case "CONTRACT_RENEWAL":
      return [
        { label: "계약 갱신", href: workerHref },
        { label: "근로자 상세", href: workerHref },
      ];
    case "CHANGE_REPORT":
      return [
        { label: "신고하기", href: workerHref },
        { label: "근로자 상세", href: workerHref },
      ];
  }
}

// ─── Section Transforms ──────────────────────────────────────────

function transformAlert(raw: DashboardRawAlert): DashboardAlert {
  return {
    id: String(raw.deadlineId),
    level: STATUS_TO_LEVEL[raw.status] ?? "info",
    title: `${ALERT_TITLE_MAP[raw.deadlineType] ?? raw.deadlineType} — ${raw.workerName}`,
    description: raw.description,
    dDay: raw.dDay,
    badgeText: formatBadgeText(raw.dDay),
    actions: buildAlertActions(raw.workerId, raw.deadlineType),
  };
}

function transformVisaDistribution(raw: VisaRawDistributionItem): VisaDistributionItem {
  return {
    type: raw.visaType,
    count: raw.count,
    percentage: raw.percentage,
  };
}

function transformInsuranceSummary(raw: InsuranceRawSummaryItem): InsuranceSummaryItem {
  const gap = raw.totalWorkers - raw.mandatoryCount;
  const isOk = gap === 0;
  return {
    type: raw.insuranceType,
    enrolled: raw.mandatoryCount,
    label: INSURANCE_LABEL_MAP[raw.insuranceType] ?? raw.insuranceType,
    status: isOk ? "ok" : "warn",
    statusText: isOk ? "✓ 전원" : `${gap} 미가입`,
  };
}

function transformComplianceBreakdown(raw: ComplianceRawBreakdownItem): ComplianceBreakdownItem {
  return {
    label: COMPLIANCE_CATEGORY_LABEL_MAP[raw.category] ?? raw.category,
    score: raw.score,
  };
}

function transformDeadline(raw: DashboardRawDeadline): DashboardDeadline {
  return {
    id: String(raw.deadlineId),
    title: DEADLINE_TYPE_LABELS[raw.deadlineType] ?? raw.deadlineType,
    workerName: raw.workerName,
    visaType: raw.visaType,
    dDay: raw.dDay,
    urgency: STATUS_TO_URGENCY[raw.status] ?? "safe",
  };
}

// ─── Main Transform ──────────────────────────────────────────────

export function transformDashboardResponse(raw: DashboardRawResponse): DashboardResponse {
  return {
    stats: {
      totalWorkers: raw.stats.totalWorkers,
      visaBreakdown: raw.stats.visaBreakdown.map((v) => ({
        type: v.visaType,
        count: v.count,
      })),
      insuranceRate: raw.stats.insuranceRate,
      insuranceRateChange: null,
      upcomingDeadlines: raw.stats.upcomingDeadlines,
      deadlineBreakdown: raw.stats.deadlineBreakdown,
      urgentActions: raw.stats.urgentActions,
      urgentBreakdown: raw.stats.urgentBreakdown,
    },
    alerts: raw.alerts.map(transformAlert),
    visaDistribution: raw.visaDistribution.map(transformVisaDistribution),
    insuranceSummary: raw.insuranceSummary.map(transformInsuranceSummary),
    complianceScore: {
      total: raw.complianceScore.total,
      breakdown: raw.complianceScore.breakdown.map(transformComplianceBreakdown),
    },
    aiInsight: raw.aiInsight,
    upcomingDeadlines: raw.upcomingDeadlines.map(transformDeadline),
  };
}
