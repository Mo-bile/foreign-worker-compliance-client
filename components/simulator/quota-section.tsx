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
      title="쿼터 현황"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-blue-bg px-2 py-0.5 text-[11px] font-semibold text-signal-blue">
          {data.industry}
        </span>
      }
      defaultOpen={defaultOpen}
      muted={muted}
    >
      <div className="space-y-0">
        <DataRow label="업종" value={data.industry} />
        <DataRow label="금년 쿼터" value={data.currentYearQuota} />
      </div>

      <div className="mt-4 mb-2 text-[13px] font-semibold">연도별 추이</div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              연도
            </th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              쿼터
            </th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">
              출처
            </th>
          </tr>
        </thead>
        <tbody>
          {data.yearRows.map((row) => (
            <tr key={row.year}>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                )}
              >
                {row.year}년{row.isCurrent && " (현재)"}
              </td>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                )}
              >
                {row.quotaCount}
              </td>
              <td className="border border-border px-2.5 py-2.5 text-muted-foreground">
                {row.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
