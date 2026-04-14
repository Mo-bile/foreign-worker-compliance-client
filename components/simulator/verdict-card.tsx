"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerdictDisplayData } from "@/types/simulator";

interface VerdictCardProps {
  readonly data: VerdictDisplayData;
}

const PROGRESS_COLORS = {
  low: "bg-signal-green",
  mid: "bg-signal-yellow",
  high: "bg-signal-orange",
  critical: "bg-signal-red",
} as const;

export function VerdictCard({ data }: VerdictCardProps) {
  const isExceeded = data.verdict === "EXCEEDED";

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card p-6",
        isExceeded ? "border-signal-red" : "border-signal-green",
      )}
    >
      {/* Title */}
      <div
        className={cn(
          "mb-3 flex items-center gap-2 text-lg font-bold",
          isExceeded ? "text-signal-red" : "text-signal-green",
        )}
      >
        {isExceeded ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
        {data.title}
      </div>

      {/* Limit text */}
      <p className="mb-3 text-sm leading-relaxed">{data.limitText}</p>

      {/* Quota display */}
      <div className="mb-3 rounded-lg bg-secondary p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] text-muted-foreground">현재 고용 중</span>
          <span className="text-[15px] font-bold">{data.currentCount}명</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted-foreground">잔여 한도</span>
          <span
            className={cn(
              "text-[15px] font-bold",
              isExceeded ? "text-signal-red" : "text-signal-green",
            )}
          >
            {data.remainingCapacity}명
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span>고용 현황</span>
          <span className="font-semibold">
            {data.currentCount} / {data.totalLimit} ({data.usagePercent}%)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-[800ms] ease-out",
              PROGRESS_COLORS[data.progressLevel],
            )}
            style={{ width: `${Math.min(data.usagePercent, 100)}%` }}
            role="progressbar"
            aria-valuenow={data.usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Summary text */}
      <p className="text-sm leading-relaxed">{data.summaryText}</p>
    </div>
  );
}
