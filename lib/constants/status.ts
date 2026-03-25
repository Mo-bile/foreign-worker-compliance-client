import type { DeadlineStatus } from "@/types/api";

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

type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT: "var(--signal-orange)",
  APPROACHING: "var(--signal-yellow)",
  PENDING: "var(--signal-green)",
} as const;
