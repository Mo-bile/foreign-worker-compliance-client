import type { ImpactLevel, LegalCategory } from "@/types/legal";

export const CATEGORY_LABELS: Record<LegalCategory, string> = {
  IMMIGRATION: "체류·신분",
  LABOR: "근로조건",
  WAGE_RETIREMENT: "임금·퇴직",
  SAFETY: "안전·보건",
  INSURANCE: "사회보험",
};

export const CATEGORY_ICONS: Record<LegalCategory, string> = {
  IMMIGRATION: "🛂",
  LABOR: "⚖️",
  WAGE_RETIREMENT: "💰",
  SAFETY: "🦺",
  INSURANCE: "🏥",
};

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

export const IMPACT_LEVEL_COLORS: Record<ImpactLevel, string> = {
  HIGH: "text-signal-red",
  MEDIUM: "text-signal-orange",
  LOW: "text-signal-green",
};
