import { Badge } from "@/components/ui/badge";
import type { DeadlineStatus } from "@/types/api";

const STATUS_CONFIG: Record<
  DeadlineStatus,
  { label: string; className: string }
> = {
  OVERDUE: {
    label: "기한초과",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
  URGENT: {
    label: "긴급",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
  APPROACHING: {
    label: "임박",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  PENDING: {
    label: "대기",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  COMPLETED: {
    label: "완료",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
};

export function StatusBadge({ status }: { readonly status: DeadlineStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
