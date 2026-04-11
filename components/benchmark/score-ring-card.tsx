"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "./score-ring";

interface ScoreRingCardProps {
  readonly managementScore: number;
  readonly analyzedAt: string;
}

export function ScoreRingCard({ managementScore, analyzedAt }: ScoreRingCardProps) {
  const date = new Date(analyzedAt);
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="flex flex-col items-center justify-center p-6">
      <CardContent className="flex flex-col items-center gap-3 p-0">
        <ScoreRing score={managementScore} size={160} />
        <p className="text-sm font-medium text-muted-foreground">관리 수준 점수</p>
        <p className="text-xs text-muted-foreground">{dateStr} 분석</p>
      </CardContent>
    </Card>
  );
}
