import type { QuickActions } from "@/types/benchmark";

interface QuickActionCardsProps {
  readonly actions: QuickActions;
}

export function QuickActionCards({ actions }: QuickActionCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="cursor-pointer rounded-lg bg-signal-red-bg p-4 transition-opacity hover:opacity-80">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚨</span>
          <span className="text-sm font-semibold text-signal-red">
            즉시 조치 필요 {actions.urgent.count}건
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {actions.urgent.items.map((item) => item.text).join(", ")}
        </p>
      </div>
      <div className="cursor-pointer rounded-lg bg-signal-orange-bg p-4 transition-opacity hover:opacity-80">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="text-sm font-semibold text-signal-orange">
            개선 권고 {actions.improvement.count}건
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {actions.improvement.items.map((item) => item.text).join(", ")}
        </p>
      </div>
    </div>
  );
}
