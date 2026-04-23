import type {
  DashboardRawResponse,
  DashboardRawAlert,
  InsuranceRawSummaryItem,
  ComplianceRawBreakdownItem,
  DashboardRawDeadline,
  VisaRawDistributionItem,
  DashboardResponse,
  AlertGroup,
  AlertGroupUrgency,
  InsuranceSummaryItem,
  ComplianceBreakdownItem,
  DeadlineUrgency,
  VisaDistributionItem,
  TimelineItem,
} from "@/types/dashboard";
import type { DeadlineType } from "@/types/api";
import { DEADLINE_TYPE_LABELS } from "@/types/api";

// ─── Constants ───────────────────────────────────────────────────

// dDay 규약: 양수 = N일 초과(overdue), 0 = 당일, 음수 = N일 남음
const CRITICAL_DDAY_THRESHOLD = 0;
const WARNING_DDAY_THRESHOLD = -7;
const TIMELINE_MAX_ITEMS = 5;

const URGENCY_PRIORITY: Record<AlertGroupUrgency, number> = {
  critical: 0,
  warning: 1,
  caution: 2,
};

const STATUS_TO_URGENCY: Record<string, DeadlineUrgency> = {
  OVERDUE: "overdue",
  URGENT: "d7",
  APPROACHING: "d30",
  PENDING: "safe",
  COMPLETED: "safe",
};

const ALERT_TITLE_MAP: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료 임박",
  NATIONAL_PENSION_ENROLLMENT: "국민연금 취득신고",
  HEALTH_INSURANCE_ENROLLMENT: "건강보험 취득신고",
  EMPLOYMENT_INSURANCE_ENROLLMENT: "고용보험 취득신고",
  INDUSTRIAL_ACCIDENT_ENROLLMENT: "산재보험 취득신고",
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

function toAlertGroupUrgency(dDay: number): AlertGroupUrgency {
  if (dDay >= CRITICAL_DDAY_THRESHOLD) return "critical";
  if (dDay >= WARNING_DDAY_THRESHOLD) return "warning";
  return "caution";
}

function higherUrgency(a: AlertGroupUrgency, b: AlertGroupUrgency): AlertGroupUrgency {
  return URGENCY_PRIORITY[a] <= URGENCY_PRIORITY[b] ? a : b;
}

function toDeadlineUrgency(status: string): DeadlineUrgency {
  const mapped = STATUS_TO_URGENCY[status];
  if (mapped !== undefined) return mapped;
  console.error(`[toDeadlineUrgency] Unknown status: "${status}". Defaulting to "overdue".`);
  return "overdue";
}

function formatDateKorean(isoDate: string): string {
  const parts = isoDate.split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (Number.isNaN(month) || Number.isNaN(day)) {
    console.warn(`[formatDateKorean] Invalid date format: "${isoDate}"`);
    return isoDate;
  }
  return `${month}월 ${day}일`;
}

// ─── Section Transforms ──────────────────────────────────────────

function transformAlertGroups(alerts: readonly DashboardRawAlert[]): readonly AlertGroup[] {
  const grouped = new Map<
    string,
    { alerts: readonly DashboardRawAlert[]; maxUrgency: AlertGroupUrgency }
  >();

  for (const alert of alerts) {
    const key = alert.deadlineType;
    const urgency = toAlertGroupUrgency(alert.dDay);
    const existing = grouped.get(key);
    if (existing) {
      grouped.set(key, {
        alerts: [...existing.alerts, alert],
        maxUrgency: higherUrgency(existing.maxUrgency, urgency),
      });
    } else {
      grouped.set(key, { alerts: [alert], maxUrgency: urgency });
    }
  }

  return [...grouped.entries()]
    .map(([type, { alerts: groupAlerts, maxUrgency }]) => ({
      deadlineType: type as DeadlineType,
      label: ALERT_TITLE_MAP[type as DeadlineType] ?? type,
      count: groupAlerts.length,
      urgency: maxUrgency,
      href: `/compliance?type=${type}`,
    }))
    .sort((a, b) => URGENCY_PRIORITY[a.urgency] - URGENCY_PRIORITY[b.urgency]);
}

function transformTimeline(deadlines: readonly DashboardRawDeadline[]): readonly TimelineItem[] {
  return [...deadlines]
    .sort((a, b) => a.dDay - b.dDay)
    .slice(0, TIMELINE_MAX_ITEMS)
    .map((d) => ({
      id: String(d.deadlineId),
      date: formatDateKorean(d.dueDate),
      deadlineLabel: DEADLINE_TYPE_LABELS[d.deadlineType] ?? d.deadlineType,
      workerName: d.workerName,
      urgency: toDeadlineUrgency(d.status),
    }));
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
    alertGroups: transformAlertGroups(raw.alerts),
    visaDistribution: raw.visaDistribution.map(transformVisaDistribution),
    insuranceSummary: raw.insuranceSummary.map(transformInsuranceSummary),
    complianceScore: {
      score: raw.complianceScore.score ?? (raw.complianceScore as Record<string, unknown>).total as number ?? 0,
      breakdown: raw.complianceScore.breakdown.map(transformComplianceBreakdown),
    },
    aiInsight: raw.aiInsight,
    timeline: transformTimeline(raw.upcomingDeadlines),
  };
}
