import type { SignalColor } from "./shared";

export type CheckStatus = "done" | "miss" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: CheckStatus;
  readonly date?: string;
  readonly badge?: { readonly text: string; readonly color: SignalColor };
}

export interface LegalChangeSummary {
  readonly title: string;
  readonly description: string;
  readonly color: SignalColor;
}

export type UrgencyLevel = "urgent" | "warning" | "normal";

export interface UpcomingItem {
  readonly title: string;
  readonly description: string;
  readonly urgency: UrgencyLevel;
}

export interface ComplianceReportResponse {
  readonly id: string;
  readonly title: string;
  readonly period: string;
  readonly score: number;
  readonly scoreChange: number;
  readonly aiSummary: string;
  readonly completed: readonly ChecklistItem[];
  readonly pending: readonly ChecklistItem[];
  readonly legalChanges: readonly LegalChangeSummary[];
  readonly upcoming: readonly UpcomingItem[];
}
