import type { LegalChangeSummary } from "@/types/report";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, { border: string; bg: string }> = {
  red: { border: "border-l-signal-red", bg: "bg-signal-red-bg" },
  orange: { border: "border-l-signal-orange", bg: "bg-signal-orange-bg" },
  yellow: { border: "border-l-signal-yellow", bg: "bg-signal-yellow-bg" },
  green: { border: "border-l-signal-green", bg: "bg-signal-green-bg" },
  blue: { border: "border-l-signal-blue", bg: "bg-signal-blue-bg" },
  gray: { border: "border-l-signal-gray", bg: "bg-signal-gray-bg" },
};

interface LegalChangeSummaryGridProps {
  readonly items: readonly LegalChangeSummary[];
}

export function LegalChangeSummaryGrid({ items }: LegalChangeSummaryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const colors = COLOR_MAP[item.color] ?? COLOR_MAP.gray;
        return (
          <div
            key={item.title}
            className={cn("rounded-md border-l-[3px] p-3", colors.border, colors.bg)}
          >
            <p className="text-[13px] font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}
