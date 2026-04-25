import type { DeadlineStatus, DeadlineType } from "@/types/api";

export const DEADLINE_STATUS_BADGE_STYLES: Record<DeadlineStatus, string> = {
  OVERDUE: "bg-[var(--signal-red-bg)] text-[var(--signal-red)] hover:bg-[var(--signal-red-bg)]",
  URGENT:
    "bg-[var(--signal-orange-bg)] text-[var(--signal-orange)] hover:bg-[var(--signal-orange-bg)]",
  APPROACHING:
    "bg-[var(--signal-yellow-bg)] text-[var(--signal-yellow)] hover:bg-[var(--signal-yellow-bg)]",
  PENDING: "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  COMPLETED:
    "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
} as const;

type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED" | "PENDING">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT: "var(--signal-orange)",
  APPROACHING: "var(--signal-yellow)",
} as const;

export const DEADLINE_TYPE_DESCRIPTIONS: Partial<Record<DeadlineType, string>> = {
  CHANGE_REPORT: "고용센터 신고 (외고법) + 출입국관리사무소 신고 (출입국관리법) 양쪽 의무",
};
