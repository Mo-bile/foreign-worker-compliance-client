import type { ChecklistItem } from "@/types/report";
import { cn } from "@/lib/utils";
import { BADGE_COLORS, BADGE_FALLBACK } from "@/lib/constants/signal-colors";

const STATUS_CONFIG = {
  done: { icon: "✓", color: "text-signal-green bg-signal-green-bg", label: "완료" },
  miss: { icon: "!", color: "text-signal-red bg-signal-red-bg", label: "미완료" },
  pending: { icon: "⏳", color: "text-signal-yellow bg-signal-yellow-bg", label: "진행중" },
} as const;

interface ChecklistItemRowProps {
  readonly item: ChecklistItem;
}

export function ChecklistItemRow({ item }: ChecklistItemRowProps) {
  const config = STATUS_CONFIG[item.status];

  return (
    <div className="flex items-center gap-3 py-2">
      <span
        aria-label={config.label}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-xs",
          config.color,
        )}
      >
        {config.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
      {item.badge && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            BADGE_COLORS[item.badge.color] ?? BADGE_FALLBACK,
          )}
        >
          {item.badge.text}
        </span>
      )}
    </div>
  );
}
