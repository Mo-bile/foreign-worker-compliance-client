import { Card, CardContent } from "@/components/ui/card";
import type { SimulationVerdict } from "@/types/simulator";

interface ResultVerdictProps {
  readonly verdict: SimulationVerdict;
  readonly verdictText: string;
  readonly summary: string;
  readonly analyzedAt: string;
  readonly dataSourceCount: number;
}

const VERDICT_COLOR_MAP: Record<SimulationVerdict, string> = {
  HIGH: "text-signal-green",
  MEDIUM: "text-signal-orange",
  LOW: "text-signal-red",
};

function formatAnalyzedAt(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export function ResultVerdict({
  verdict,
  verdictText,
  summary,
  analyzedAt,
  dataSourceCount,
}: ResultVerdictProps) {
  const verdictColorClass = VERDICT_COLOR_MAP[verdict];
  const formattedDate = formatAnalyzedAt(analyzedAt);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-row items-center gap-3">
          <span className="bg-signal-green-bg text-signal-green rounded-full px-2 py-0.5 text-xs font-medium">
            <span aria-hidden="true">✓</span> <span>분석 완료</span>
          </span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          <span className="text-xs text-muted-foreground">{dataSourceCount}개 데이터 소스 분석</span>
        </div>

        <p className={`mt-3 text-[22px] font-bold ${verdictColorClass}`}>
          배정 가능성: {verdictText}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
