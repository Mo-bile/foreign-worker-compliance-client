"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from "recharts";
import type { WageAnalysis } from "@/types/benchmark";
import { DataSourceMeta } from "./data-source-meta";

interface WageAnalysisCardProps {
  readonly wageAnalysis: WageAnalysis;
}

function formatCount(thousands: number): string {
  if (thousands === 0) return "0명";
  if (thousands < 10) return `${thousands}천명`;
  return `${(thousands / 10).toFixed(1)}만명`.replace(".0만명", "만명");
}

export function WageAnalysisCard({ wageAnalysis }: WageAnalysisCardProps) {
  const { distribution, companyBracket, companyAvgWage, visaType } = wageAnalysis;

  const data = [
    { bracket: "~100만", count: distribution.under100, key: "under100" },
    { bracket: "100~200", count: distribution.from100to200, key: "from100to200" },
    { bracket: "200~300", count: distribution.from200to300, key: "from200to300" },
    { bracket: "300만+", count: distribution.over300, key: "over300" },
  ];

  const bracketKeyMap: Record<string, string> = {
    "~100만": "under100",
    "100~200만": "from100to200",
    "200~300만": "from200to300",
    "300만+": "over300",
  };
  const activeBracketKey = companyBracket ? bracketKeyMap[companyBracket] : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">💰 임금 구간 포지셔닝</h3>
          <span className="rounded-full bg-[oklch(0.95_0.03_255)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_255)]">
            {visaType}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          E-9 임금근로자 월평균 임금 구간 (2025.5)
        </p>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="bracket"
              tick={{ fontSize: 11, fill: "oklch(0.5 0.01 260)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              <LabelList
                dataKey="count"
                position="top"
                formatter={(v: number) => formatCount(v)}
                style={{ fontSize: 10, fontWeight: 600, fill: "oklch(0.4 0.01 260)" }}
              />
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={
                    entry.key === activeBracketKey ? "oklch(0.6 0.15 255)" : "oklch(0.85 0.04 255)"
                  }
                  stroke={entry.key === activeBracketKey ? "oklch(0.6 0.15 255)" : "none"}
                  strokeWidth={entry.key === activeBracketKey ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {companyBracket && (
          <div className="flex items-center gap-1.5 text-xs text-[oklch(0.6_0.15_255)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.15_255)]" />
            귀사 {companyBracket} 구간
          </div>
        )}

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
