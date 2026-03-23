import type { DeadlineStatus } from "@/types/api";

export const DEADLINE_STATUS_BADGE_STYLES: Record<DeadlineStatus, string> = {
  OVERDUE: "bg-red-100 text-red-800 hover:bg-red-200",
  URGENT: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  APPROACHING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  PENDING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
} as const;

type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT: "#ef4444",
  APPROACHING: "#f59e0b",
  PENDING: "#22c55e",
} as const;
