import { Badge } from "@/components/ui/badge";
import { DEADLINE_STATUS_LABELS } from "@/types/api";
import type { DeadlineStatus } from "@/types/api";
import { DEADLINE_STATUS_BADGE_STYLES } from "@/lib/constants/status";

export function StatusBadge({ status }: { readonly status: DeadlineStatus }) {
  return (
    <Badge variant="secondary" className={DEADLINE_STATUS_BADGE_STYLES[status]}>
      {DEADLINE_STATUS_LABELS[status]}
    </Badge>
  );
}
