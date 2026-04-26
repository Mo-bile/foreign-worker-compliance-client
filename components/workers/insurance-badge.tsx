import { Badge } from "@/components/ui/badge";
import { INSURANCE_STATUS_LABELS } from "@/types/api";
import type { InsuranceStatus } from "@/types/api";

const STATUS_STYLES: Record<InsuranceStatus, string> = {
  MANDATORY:
    "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  FULL_MANDATORY:
    "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  AUTO_BENEFITS_OPT_IN:
    "bg-[var(--signal-indigo-bg)] text-[var(--signal-indigo)] hover:bg-[var(--signal-indigo-bg)]",
  OPTIONAL_ON_APPLICATION:
    "bg-[var(--signal-gray-bg)] text-[var(--signal-gray)] hover:bg-[var(--signal-gray-bg)]",
  EXEMPT:
    "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
};

interface InsuranceBadgeProps {
  readonly status: InsuranceStatus;
  readonly label?: string;
}

export function InsuranceBadge({ status, label }: InsuranceBadgeProps) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[status] ?? ""}>
      {label ?? INSURANCE_STATUS_LABELS[status]}
    </Badge>
  );
}
