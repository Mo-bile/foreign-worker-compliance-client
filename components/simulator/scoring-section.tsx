import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";
import type { ScoringDisplayData } from "@/types/simulator";

interface ScoringSectionProps {
  readonly data: ScoringDisplayData;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
}

export function ScoringSection({ data, defaultOpen = true, muted = false }: ScoringSectionProps) {
  return (
    <CollapsibleCard
      icon={<span>🎯</span>}
      iconColorClass="bg-signal-orange-bg text-signal-orange"
      title="점수제 예상 계산"
      defaultOpen={defaultOpen}
      muted={muted}
    >
      {/* Big score display */}
      <div className="mb-4">
        <span className="text-[28px] font-bold">{data.estimatedScore}점</span>
        <span className="ml-2 text-[13px] text-muted-foreground">
          {data.percentileText} 수준
          <span className="ml-1 text-[11px] text-muted-foreground/60">
            ({data.percentileDisclaimer})
          </span>
        </span>
      </div>

      {/* Score table */}
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th
              className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold"
              style={{ width: "60%" }}
            >
              항목
            </th>
            <th
              className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold"
              style={{ width: "25%" }}
            >
              점수
            </th>
            <th
              className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold"
              style={{ width: "15%" }}
            >
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {data.tableRows.map((row, i) => {
            const isLast = i === data.tableRows.length - 1;
            return (
              <tr key={row.label}>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    isLast && "font-semibold",
                    row.isDeduction && "text-signal-red",
                  )}
                >
                  {row.label}
                </td>
                <td
                  className={cn(
                    "border border-border px-2.5 py-2.5",
                    isLast && "font-semibold",
                    row.score.startsWith("+") && "font-semibold text-signal-green",
                    row.score.startsWith("-") && "font-semibold text-signal-red",
                  )}
                >
                  {row.score}
                </td>
                <td className={cn("border border-border px-2.5 py-2.5", isLast && "font-semibold")}>
                  {row.status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Improvement block */}
      {data.improvement && (
        <div className="mt-4 rounded-lg border border-signal-green/30 bg-gradient-to-br from-signal-green-bg to-signal-green-bg/70 p-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-signal-green">
            💡 점수 개선 예상 계산
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-[11px] text-muted-foreground">현재</div>
              <div className="text-[22px] font-bold">{data.improvement.currentScore}점</div>
              <div className="text-[11px] text-muted-foreground">
                {data.improvement.currentPercentile}
              </div>
            </div>
            <div className="rounded-lg border border-signal-green/30 bg-card p-3">
              <div className="text-[11px] text-signal-green">
                {data.improvement.improvementLabel}
              </div>
              <div className="text-[22px] font-bold text-signal-green">
                {data.improvement.improvedScore}점
              </div>
              <div className="text-[11px] text-signal-green">
                {data.improvement.improvedPercentile} ↑
              </div>
            </div>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed">
            {data.improvement.improvementDescription}
          </p>
        </div>
      )}
    </CollapsibleCard>
  );
}
