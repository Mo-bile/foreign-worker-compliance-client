"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "./score-ring";
import { MANAGEMENT_GRADE_COLORS, MANAGEMENT_GRADE_LABELS, type ManagementGrade } from "@/lib/constants/benchmark";
import { cn } from "@/lib/utils";

interface ScoreRingCardProps {
  readonly managementScore: number;
  readonly grade: ManagementGrade;
  readonly analyzedAt: string;
}

export function ScoreRingCard({ managementScore, grade, analyzedAt }: ScoreRingCardProps) {
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
        <span className={cn("text-sm font-semibold", MANAGEMENT_GRADE_COLORS[grade])}>
          {MANAGEMENT_GRADE_LABELS[grade]}
        </span>
        <p className="text-sm font-medium text-muted-foreground">관리 수준 점수</p>
        <p className="text-xs text-muted-foreground">{dateStr} 분석</p>
      </CardContent>
    </Card>
  );
}
