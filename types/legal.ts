import type { SignalColor } from "./shared";

// ─── Legal Changes List ─────────────────────────────
export type LegalStatus = "action_required" | "reference" | "resolved";
export type LegalSeverity = "critical" | "warning" | "info" | "resolved";

export interface LegalChange {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly lawName: string;
  readonly effectiveDate: string;
  readonly detectedDate: string;
  readonly severity: LegalSeverity;
  readonly status: LegalStatus;
  readonly badge: { readonly text: string; readonly color: SignalColor };
  readonly dDay?: number;
}

export interface LegalChangesResponse {
  readonly changes: readonly LegalChange[];
  readonly lastSyncedAt: string;
}

// ─── Legal Impact (Detail) ──────────────────────────
export interface LegalImpact {
  readonly changeId: string;
  readonly impacts: readonly string[];
  readonly aiAnalysis: string;
  readonly actions: readonly LegalAction[];
}

export interface LegalAction {
  readonly label: string;
  readonly primary?: boolean;
  readonly href?: string;
}
