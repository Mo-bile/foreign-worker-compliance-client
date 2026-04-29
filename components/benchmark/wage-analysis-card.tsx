"use client";

import { Card, CardContent } from "@/components/ui/card";
import { VISA_TYPE_LABELS, type VisaType } from "@/types/api";
import type { WageAnalysis } from "@/types/benchmark";
import { DataSourceMeta } from "./data-source-meta";

interface WageAnalysisCardProps {
  readonly wageAnalysis: WageAnalysis;
}

const BRACKET_KEY_MAP: Record<string, string> = {
  "100만원 미만": "under100",
  "100~200만원": "from100to200",
  "200~300만원": "from200to300",
  "300만원 이상": "over300",
};

const MIN_BAR_HEIGHT = 20;
const MAX_BAR_HEIGHT = 140;

export function WageAnalysisCard({ wageAnalysis }: WageAnalysisCardProps) {
  const { distribution, companyBracket, companyAvgWage, visaType } = wageAnalysis;

  const total =
    distribution.under100 +
    distribution.from100to200 +
    distribution.from200to300 +
    distribution.over300;

  const data = [
    { bracket: "~100만", count: distribution.under100, key: "under100" },
    { bracket: "100~200", count: distribution.from100to200, key: "from100to200" },
    { bracket: "200~300", count: distribution.from200to300, key: "from200to300" },
    { bracket: "300만+", count: distribution.over300, key: "over300" },
  ];

  const activeBracketKey = companyBracket ? BRACKET_KEY_MAP[companyBracket] : null;

  function getBarHeight(count: number): number {
    if (count === 0) return 2;
    const pct = total > 0 ? count / total : 0;
    return Math.max(MIN_BAR_HEIGHT, Math.round(pct * MAX_BAR_HEIGHT));
  }

  function formatPct(count: number): string {
    if (total === 0) return "0%";
    const pct = (count / total) * 100;
    if (pct < 0.1) return "0%";
    return `${pct.toFixed(1)}%`;
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">💰 임금 구간 포지셔닝</h3>
          <span className="rounded-full bg-[oklch(0.95_0.03_255)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_255)]">
            {VISA_TYPE_LABELS[visaType as VisaType]}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          E-9 임금근로자 월평균 임금 구간 (2025.5)
        </p>

        <div className="flex items-end gap-3" style={{ height: MAX_BAR_HEIGHT + 40 }}>
          {data.map((item) => {
            const isActive = item.key === activeBracketKey;
            return (
              <div key={item.key} className="flex flex-1 flex-col items-center">
                <span className="mb-1 text-[10px] font-semibold text-[oklch(0.4_0.01_260)]">
                  {formatPct(item.count)}
                </span>
                <div
                  className={`w-full rounded-t ${
                    item.count === 0
                      ? "bg-[oklch(0.92_0.01_260)]"
                      : isActive
                        ? "bg-[oklch(0.6_0.15_255)] shadow-[0_0_0_2px_oklch(0.6_0.15_255),0_0_10px_rgba(107,138,253,0.2)]"
                        : "bg-[oklch(0.85_0.04_255)]"
                  }`}
                  style={{ height: getBarHeight(item.count) }}
                />
                <span className="mt-2 text-[10px] text-muted-foreground">{item.bracket}</span>
                {isActive && (
                  <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.6_0.15_255)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.15_255)]" />
                    귀사
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {companyAvgWage != null && (
          <div className="border-t border-dashed pt-2 text-xs text-muted-foreground">
            귀사 평균 <strong className="text-foreground">{companyAvgWage}만원</strong>
          </div>
        )}
        <DataSourceMeta
          source="KOSIS 이민자체류실태및고용조사(D_23)"
          baseDate="2025.5"
          population="비전문취업(E-9) 임금근로자"
          caution="4구간 분포, 반올림으로 합계 불일치 가능"
        />
      </CardContent>
    </Card>
  );
}
