export const MANAGEMENT_GRADES = ["EXCELLENT", "GOOD", "CAUTION", "RISK"] as const;
export type ManagementGrade = (typeof MANAGEMENT_GRADES)[number];

export const MANAGEMENT_GRADE_LABELS: Record<ManagementGrade, string> = {
  EXCELLENT: "우수",
  GOOD: "양호",
  CAUTION: "주의",
  RISK: "위험",
};

export const MANAGEMENT_GRADE_COLORS: Record<ManagementGrade, string> = {
  EXCELLENT: "text-signal-green",
  GOOD: "text-signal-orange",
  CAUTION: "text-signal-yellow",
  RISK: "text-signal-red",
};
