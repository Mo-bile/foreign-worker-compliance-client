import type { DisplayStatus, ImpactLevel, LegalCategory, SourceType } from "@/types/legal";

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

export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  UPCOMING: "시행 예정",
  RECENTLY_EFFECTIVE: "최근 시행됨 — 준수 필요",
  IN_FORCE: "기존 의무 (상시)",
};

export const DISPLAY_STATUS_COLORS: Record<
  DisplayStatus,
  { badge: string; dot: string }
> = {
  UPCOMING: { badge: "bg-signal-blue-bg text-signal-blue", dot: "bg-signal-blue" },
  RECENTLY_EFFECTIVE: {
    badge: "bg-signal-green-bg text-signal-green",
    dot: "bg-signal-green",
  },
  IN_FORCE: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  LAW: "법률",
  ENFORCEMENT_DECREE: "시행령",
  ENFORCEMENT_RULE: "시행규칙",
  NOTICE: "공지",
  POLICY_NOTICE: "정책 공고",
  PRESS_RELEASE: "보도자료",
  GUIDANCE: "가이드",
};
