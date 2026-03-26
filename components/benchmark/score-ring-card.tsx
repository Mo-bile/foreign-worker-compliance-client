import { Card, CardContent } from "@/components/ui/card";
import type { BenchmarkScore } from "@/types/benchmark";
import { ScoreRing } from "./score-ring";
import { CategoryBar } from "./category-bar";

interface ScoreRingCardProps {
  readonly score: BenchmarkScore;
  readonly analyzedAt: string;
}

export function ScoreRingCard({ score, analyzedAt }: ScoreRingCardProps) {
  const dateStr = new Date(analyzedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const changeText =
    score.change > 0
      ? `+${score.change}점`
      : score.change < 0
        ? `${score.change}점`
        : "변동 없음";

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <ScoreRing score={score.total} />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">양호</p>
          <span className="mt-1 inline-block rounded-full bg-signal-orange-bg px-3 py-1 text-sm font-semibold text-signal-orange">
            {score.grade}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">
            {dateStr} 기준 · 전분기 대비 {changeText}
          </p>
        </div>
        <div className="w-full space-y-2">
          {score.categories.map((cat) => (
            <CategoryBar key={cat.label} label={cat.label} score={cat.score} color={cat.color} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
