import type { UpcomingItem } from "@/types/report";
import { cn } from "@/lib/utils";

const URGENCY_COLORS: Record<string, string> = {
  urgent: "border-l-signal-red",
  warning: "border-l-signal-orange",
  normal: "border-l-signal-blue",
};

interface UpcomingGridProps {
  readonly items: readonly UpcomingItem[];
}

export function UpcomingGrid({ items }: UpcomingGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.title}
          className={cn(
            "rounded-md border-l-[3px] bg-secondary p-3",
            URGENCY_COLORS[item.urgency] ?? "border-l-signal-blue",
          )}
        >
          <p className="text-[13px] font-semibold">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
