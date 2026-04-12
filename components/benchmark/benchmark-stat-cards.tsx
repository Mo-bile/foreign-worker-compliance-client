"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { BenchmarkResponse } from "@/types/benchmark";

interface BenchmarkStatCardsProps {
  readonly benchmark: BenchmarkResponse;
}

interface StatCardData {
  readonly label: string;
  readonly value: string;
  readonly sub: string;
  readonly accentColor: string;
  readonly bgColor: string;
  readonly icon: string;
}

function getStatCards(benchmark: BenchmarkResponse): StatCardData[] {
  const { wageAnalysis, stabilityAnalysis, managementCheck, positioningAnalysis } = benchmark;

  return [
    {
      label: "임금 포지셔닝",
      value: wageAnalysis ? `${wageAnalysis.companyAvgWage ?? "—"}만원` : "—",
      sub: wageAnalysis ? `${wageAnalysis.companyBracket ?? "—"} 구간` : "미입력",
      accentColor: "border-t-[oklch(0.6_0.15_255)]",
      bgColor: "bg-[oklch(0.95_0.03_255)]",
      icon: "💰",
    },
    {
      label: "고용 안정성",
      value: stabilityAnalysis?.turnoverRate != null ? `${stabilityAnalysis.turnoverRate}%` : "—",
      sub: stabilityAnalysis
        ? `최근 1년 퇴사율 (${stabilityAnalysis.terminationCount}명/${stabilityAnalysis.foreignWorkerCount}명)`
        : "미입력",
      accentColor: "border-t-[oklch(0.65_0.18_55)]",
      bgColor: "bg-[oklch(0.95_0.03_55)]",
      icon: "📊",
    },
    {
      label: "관리 수준",
      value: `${managementCheck.passedItems} / ${managementCheck.totalItems}`,
      sub: (() => {
        const failedRequired = managementCheck.items.filter(
          (item) => item.required && !item.passed,
        ).length;
        return failedRequired > 0 ? `법적의무 ${failedRequired}건 미충족` : "전체 충족";
      })(),
      accentColor: "border-t-[oklch(0.65_0.18_55)]",
      bgColor: "bg-[oklch(0.95_0.03_55)]",
      icon: "✅",
    },
    {
      label: "지역·업종",
      value: positioningAnalysis.region,
      sub: `${positioningAnalysis.industryCategory} · ${positioningAnalysis.companyForeignWorkerCount}명 고용`,
      accentColor: "border-t-[oklch(0.6_0.15_255)]",
      bgColor: "bg-[oklch(0.95_0.03_255)]",
      icon: "📍",
    },
  ];
}

export function BenchmarkStatCards({ benchmark }: BenchmarkStatCardsProps) {
  const cards = getStatCards(benchmark);

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className={`border-t-3 ${card.accentColor} gap-0 py-4`}>
          <CardContent className="space-y-2 px-4 py-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${card.bgColor}`}
            >
              {card.icon}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className="text-xl font-extrabold tracking-tight">{card.value}</p>
            <p className="text-[11px] text-muted-foreground">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
