import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";
import type { WhatIfDisplayData } from "@/types/simulator";

interface WhatIfSectionProps {
  readonly data: WhatIfDisplayData;
}

const BADGE_STYLES: Record<string, string> = {
  IMPOSSIBLE: "bg-signal-red-bg text-signal-red",
  INSUFFICIENT: "bg-signal-red-bg text-signal-red",
  POSSIBLE: "bg-signal-green-bg text-signal-green",
  SURPLUS: "bg-signal-green-bg text-signal-green",
};

export function WhatIfSection({ data }: WhatIfSectionProps) {
  return (
    <CollapsibleCard
      icon={<span>🔄</span>}
      iconColorClass="bg-signal-orange-bg text-signal-orange"
      title="한도 확대 시뮬레이션"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-orange-bg px-2 py-0.5 text-[11px] font-semibold text-signal-orange">
          What-if
        </span>
      }
      defaultOpen
    >
      <p className="mb-4 text-[13px] text-muted-foreground">
        내국인 피보험자 수를 늘리면 고용 한도가 증가합니다. 아래는 시뮬레이션 결과입니다.
      </p>

      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              내국인 피보험자
            </th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              고용 한도
            </th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              잔여 한도
            </th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              채용 가능
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => {
            const isCurrent = row.delta === "현재";
            const isPositive = row.feasibility === "POSSIBLE" || row.feasibility === "SURPLUS";
            return (
              <tr key={row.domesticInsuredCount}>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    !isCurrent && "font-semibold",
                  )}
                >
                  {row.domesticInsuredCount}명 ({row.delta})
                </td>
                <td className="border border-border px-2.5 py-2.5">{row.newLimit}명</td>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    isPositive && "font-semibold text-signal-green",
                    !isPositive && row.remainingCapacity === 0 && "font-semibold text-signal-red",
                  )}
                >
                  {row.remainingCapacity}명
                </td>
                <td className="border border-border px-2.5 py-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      BADGE_STYLES[row.feasibility],
                    )}
                  >
                    {row.feasibilityLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Minimum condition highlight */}
      <div className="mt-3 rounded-lg bg-signal-green-bg p-3">
        <p className="text-xs leading-relaxed">
          <strong className="text-signal-green">최소 조건:</strong> {data.minimumConditionText}
        </p>
      </div>
    </CollapsibleCard>
  );
}
