"use client";

import { Card, CardContent } from "@/components/ui/card";
import { INDUSTRY_CATEGORY_LABELS, REGION_LABELS } from "@/types/api";
import type { PositioningAnalysis } from "@/types/benchmark";
import { DataSourceMeta } from "./data-source-meta";

interface PositioningCardProps {
  readonly positioningAnalysis: PositioningAnalysis;
}

export function PositioningCard({ positioningAnalysis }: PositioningCardProps) {
  const {
    region,
    industryCategory,
    regionalTotal,
    industryTotal,
    companyForeignWorkerCount,
    companyShare,
    sizeCategory,
  } = positioningAnalysis;
  const regionLabel = REGION_LABELS[region as keyof typeof REGION_LABELS] ?? region;
  const industryCategoryLabel =
    INDUSTRY_CATEGORY_LABELS[industryCategory as keyof typeof INDUSTRY_CATEGORY_LABELS] ??
    industryCategory;

  const items = [
    { label: "지역 외국인 총수", value: regionalTotal.toLocaleString("ko-KR"), unit: "명" },
    {
      label: "업종 외국인 수",
      value: industryTotal.toLocaleString("ko-KR"),
      unit: "명",
      sub: industryCategoryLabel,
    },
    { label: "귀사 고용", value: companyForeignWorkerCount.toLocaleString("ko-KR"), unit: "명" },
    { label: "귀사 점유율", value: (companyShare * 100).toFixed(1), unit: "%" },
  ];

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">📍 지역·업종 포지셔닝</h3>
          <span className="rounded-full bg-[oklch(0.95_0.03_255)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.45_0.12_255)]">
            {regionLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[oklch(0.9_0.02_300)] bg-[oklch(0.98_0.01_300)] p-3"
            >
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-lg font-extrabold text-[oklch(0.25_0.03_260)]">
                {item.value}
                <span className="text-xs font-medium text-muted-foreground">{item.unit}</span>
              </p>
              {item.sub && <p className="text-[11px] text-muted-foreground">{item.sub}</p>}
            </div>
          ))}
        </div>

        {/* 규모 등급 하이라이트 */}
        <div className="rounded-lg border border-[oklch(0.85_0.04_280)] bg-gradient-to-r from-[oklch(0.97_0.02_300)] to-[oklch(0.96_0.02_260)] p-3 text-center">
          <p className="text-[11px] text-muted-foreground">규모 등급</p>
          <p className="text-sm font-bold text-[oklch(0.4_0.12_300)]">{sizeCategory} 사업장</p>
        </div>
        <DataSourceMeta
          source="한국고용정보원 EIS(15105236)"
          baseDate="2024.12"
          population="해당 지역·업종 사업장"
          caution="고용보험 피보험자 기준"
        />
      </CardContent>
    </Card>
  );
}
