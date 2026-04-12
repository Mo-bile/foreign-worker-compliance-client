"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { StabilityAnalysis } from "@/types/benchmark";
import { DataSourceMeta } from "./data-source-meta";

interface StabilityAnalysisCardProps {
  readonly stabilityAnalysis: StabilityAnalysis;
}

export function StabilityAnalysisCard({ stabilityAnalysis }: StabilityAnalysisCardProps) {
  const { turnoverRate, terminationCount, foreignWorkerCount, terminationReasons } =
    stabilityAnalysis;

  const badgeLabel = turnoverRate != null && turnoverRate > 15 ? "주의" : "양호";
  const badgeColor =
    turnoverRate != null && turnoverRate > 15
      ? "bg-[oklch(0.93_0.04_55)] text-[oklch(0.45_0.12_55)]"
      : "bg-[oklch(0.94_0.04_155)] text-[oklch(0.4_0.12_155)]";

  const reasonData = [
    { reason: "임금 낮음", pct: terminationReasons.lowWage },
    { reason: "회사 사정", pct: terminationReasons.companyIssue },
    { reason: "위험", pct: terminationReasons.dangerous },
    { reason: "더 좋은 일자리", pct: terminationReasons.betterJob },
    { reason: "환경", pct: terminationReasons.environment },
    { reason: "임금 체불", pct: terminationReasons.wageDelay },
  ];

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">📊 고용 안정성</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
            {badgeLabel}
          </span>
        </div>

        {/* 귀사 현황 — 독립 박스 */}
        <div className="rounded-lg border border-[oklch(0.85_0.04_55)] bg-[oklch(0.97_0.02_55)] p-3">
          <p className="text-[10px] font-medium text-[oklch(0.45_0.12_55)]">
            귀사 최근 1년 이직률
          </p>
          <p className="text-xl font-extrabold text-[oklch(0.35_0.12_55)]">
            {turnoverRate != null ? `${turnoverRate}%` : "—"}
          </p>
          <p className="mt-1 text-[10px] text-[oklch(0.5_0.08_55)]">
            퇴사 {terminationCount}명 ÷ 외국인 {foreignWorkerCount}명
          </p>
        </div>

        {/* 전국 E-9 퇴사사유 분포 — 별도 박스 */}
        <div>
          <p className="mb-3 text-[10px] font-semibold text-muted-foreground">
            E-9 이전 직장 퇴사 사유 (2025.5, 직장 이동 경험자)
          </p>

          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={reasonData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 70, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="reason"
                tick={{ fontSize: 11, fill: "oklch(0.4 0.01 260)" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]} maxBarSize={14} fill="oklch(0.65 0.18 55)">
                <LabelList
                  dataKey="pct"
                  position="right"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 10, fontWeight: 600, fill: "oklch(0.4 0.01 260)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 면책 안내 */}
        <p className="text-[10px] text-muted-foreground">
          귀사 이직률과 전국 퇴사사유는 별개 지표입니다. 퇴사사유는 업종 전반의 경향 파악
          참고용으로 제공됩니다.
        </p>
        <DataSourceMeta
          source="KOSIS 이민자체류실태및고용조사(D_23)"
          baseDate="2025.5"
          population="비전문취업(E-9) 입국 후 직장을 옮긴 경험이 있는 자"
          caution="복수응답 아님, 주된 사유 1개 선택"
        />
      </CardContent>
    </Card>
  );
}
