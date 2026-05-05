import {
  EMPLOYMENT_END_REASON_LABELS,
  EMPLOYMENT_END_REASONS,
  type EmploymentEndReason,
} from "@/types/api";
import type {
  EndReasonDistributionDisplay,
  EndReasonDistributionItem,
} from "@/types/benchmark";

type EndReasonDistributionInput =
  | Readonly<Partial<Record<EmploymentEndReason, number>>>
  | null
  | undefined;

export function toEndReasonDistributionDisplay(
  distribution: EndReasonDistributionInput,
): EndReasonDistributionDisplay {
  const entries = EMPLOYMENT_END_REASONS.map(
    (code) => [code, distribution?.[code] ?? 0] as const,
  );
  const positive = entries.filter(([, count]) => count > 0);
  const total = positive.reduce((sum, [, count]) => sum + count, 0);
  const maxCount = positive.reduce((max, [, count]) => Math.max(max, count), 0);

  const items: EndReasonDistributionItem[] = positive
    .map(([code, count]) => ({
      code,
      label: EMPLOYMENT_END_REASON_LABELS[code],
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { items, total, maxCount: maxCount > 0 ? maxCount : 1 };
}
