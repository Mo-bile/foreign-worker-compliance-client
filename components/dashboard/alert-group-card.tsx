import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AlertGroup, AlertGroupUrgency } from "@/types/dashboard";

const urgencyStyles: Record<AlertGroupUrgency, { bg: string; dot: string; border: string }> = {
  critical: { bg: "bg-signal-red-bg", dot: "bg-signal-red", border: "border-signal-red/30" },
  warning: {
    bg: "bg-signal-orange-bg",
    dot: "bg-signal-orange",
    border: "border-signal-orange/30",
  },
  caution: {
    bg: "bg-signal-yellow-bg",
    dot: "bg-signal-yellow",
    border: "border-signal-yellow/30",
  },
};

interface AlertGroupCardProps {
  readonly alertGroups: readonly AlertGroup[];
}

export function AlertGroupCard({ alertGroups }: AlertGroupCardProps) {
  if (alertGroups.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">긴급 알림이 없습니다</p>;
  }

  return (
    <div className="space-y-2.5">
      {alertGroups.map((group) => {
        const style = urgencyStyles[group.urgency];
        return (
          <div
            key={group.deadlineType}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 transition-shadow hover:shadow-md",
              style.bg,
              style.border,
            )}
          >
            <div className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
            <span className="flex-1 text-[13px] font-semibold">{group.label}</span>
            <span className="text-xs text-muted-foreground">{group.count}명</span>
            <Link href={group.href} className="text-[11px] text-primary hover:underline">
              전체 보기 →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
