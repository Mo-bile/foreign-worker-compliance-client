import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";
import type { QuotaDisplayData } from "@/types/simulator";

interface QuotaSectionProps {
  readonly data: QuotaDisplayData;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
}

export function QuotaSection({ data, defaultOpen = false, muted = false }: QuotaSectionProps) {
  return (
    <CollapsibleCard
      icon={<span>📊</span>}
      iconColorClass="bg-signal-blue-bg text-signal-blue"
      title="쿼터 현황 (분기별)"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-blue-bg px-2 py-0.5 text-[11px] font-semibold text-signal-blue">
          {data.currentRound}
        </span>
      }
      defaultOpen={defaultOpen}
      muted={muted}
    >
      {/* Current round info */}
      <div className="space-y-0">
        <DataRow label="현재 접수 차수" value={data.currentRound} />
        <DataRow label="이번 차수 배정 규모" value={data.roundAllocation} />
        <DataRow label={`업종 배정 비율`} value={data.industryAllocationText} />
      </div>

      {/* Round comparison table */}
      <div className="mt-4 mb-2 text-[13px] font-semibold">차수별 비교</div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">차수</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">배정 규모</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">업종 배정</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">경쟁률</th>
          </tr>
        </thead>
        <tbody>
          {data.roundRows.map((row) => (
            <tr key={row.round}>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                  row.isFuture && "text-muted-foreground",
                )}
              >
                {row.round}
              </td>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                  row.isFuture && "text-muted-foreground",
                )}
              >
                {row.allocation}
              </td>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                  row.isFuture && "text-muted-foreground",
                )}
              >
                {row.industryAllocation}
              </td>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                  row.isFuture && "text-muted-foreground",
                )}
              >
                {row.competitionRate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Industry trend */}
      <div className="mt-4 rounded-lg bg-secondary p-3">
        <div className="mb-2 text-xs font-semibold">업종 신청 동향</div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {data.industryTrend}
        </p>
      </div>

      {/* Data source chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className="cursor-help rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="데이터 ID: 15002263"
        >
          고용노동부 외국인력 도입계획
        </span>
        <span
          className="cursor-help rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="데이터 ID: 15102368"
        >
          KOSIS 지역별 업종별 현황
        </span>
      </div>
    </CollapsibleCard>
  );
}

function DataRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-0 py-2.5 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
