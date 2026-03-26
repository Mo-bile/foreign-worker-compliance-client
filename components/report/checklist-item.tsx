import type { ChecklistItem } from "@/types/report";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  done: { icon: "\u2713", color: "text-signal-green bg-signal-green-bg", label: "\uC644\uB8CC" },
  miss: { icon: "!", color: "text-signal-red bg-signal-red-bg", label: "\uBBF8\uC644\uB8CC" },
  pending: { icon: "\u23F3", color: "text-signal-yellow bg-signal-yellow-bg", label: "\uC9C4\uD589\uC911" },
} as const;

const BADGE_COLORS: Record<string, string> = {
  red: "bg-signal-red-bg text-signal-red",
  orange: "bg-signal-orange-bg text-signal-orange",
  yellow: "bg-signal-yellow-bg text-signal-yellow",
  green: "bg-signal-green-bg text-signal-green",
  blue: "bg-signal-blue-bg text-signal-blue",
  gray: "bg-signal-gray-bg text-signal-gray",
};

interface ChecklistItemRowProps {
  readonly item: ChecklistItem;
}

export function ChecklistItemRow({ item }: ChecklistItemRowProps) {
  const config = STATUS_CONFIG[item.status];

  return (
    <div className="flex items-center gap-3 py-2">
      <span
        aria-label={config.label}
        className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs", config.color)}
      >
        {config.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
      {item.badge && (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", BADGE_COLORS[item.badge.color])}>
          {item.badge.text}
        </span>
      )}
    </div>
  );
}
