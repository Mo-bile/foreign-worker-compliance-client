import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";
import type { TimelineDisplayData } from "@/types/simulator";

interface TimelineSectionProps {
  readonly data: TimelineDisplayData;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
}

export function TimelineSection({ data, defaultOpen = true, muted = false }: TimelineSectionProps) {
  return (
    <CollapsibleCard
      icon={<span>⏱</span>}
      iconColorClass="bg-signal-yellow-bg text-signal-yellow"
      title="예상 소요기간"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-yellow-bg px-2 py-0.5 text-[11px] font-semibold text-signal-yellow">
          약 {data.estimatedMonths}개월
        </span>
      }
      defaultOpen={defaultOpen}
      muted={muted}
    >
      <div className="flex flex-col">
        {data.steps.map((step, i) => {
          const isLast = i === data.steps.length - 1;
          return (
            <div key={step.title} className="flex items-stretch gap-3">
              <div className="flex w-6 flex-col items-center">
                <div
                  className={cn(
                    "mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full",
                    isLast ? "bg-signal-green" : "bg-primary",
                  )}
                />
                {!isLast && <div className="w-0.5 flex-1 bg-border" />}
              </div>
              <div className={cn("flex-1", !isLast && "pb-4")}>
                <div className="text-[13px] font-semibold">
                  {i + 1}. {step.title}
                </div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
                <span
                  className={cn(
                    "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    step.duration.includes("개월")
                      ? "bg-signal-orange-bg text-signal-orange"
                      : "bg-signal-blue-bg text-signal-blue",
                  )}
                >
                  {step.duration}
                </span>
                {step.source && (
                  <span className="text-[11px] text-muted-foreground/60">
                    출처: {step.source}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleCard>
  );
}
