"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { StabilityAnalysis } from "@/types/benchmark";
import { DataSourceMeta } from "./data-source-meta";

interface StabilityAnalysisCardProps {
  readonly stabilityAnalysis: StabilityAnalysis;
  readonly onReasonClick?: (category: string, reasonLabel: string) => void;
}

const REASON_TO_CHECKLIST: Record<string, string | null> = {
  lowWage: "계약",
  wageDelay: "계약",
  dangerous: "안전",
  environment: "복지",
  companyIssue: "신고",
  betterJob: null,
};

export function StabilityAnalysisCard({
  stabilityAnalysis,
  onReasonClick,
}: StabilityAnalysisCardProps) {
  const { turnoverRate, terminationCount, foreignWorkerCount, terminationReasons } =
    stabilityAnalysis;

  const badgeLabel = turnoverRate != null && turnoverRate > 15 ? "주의" : "양호";
  const badgeColor =
    turnoverRate != null && turnoverRate > 15
      ? "bg-[oklch(0.93_0.04_55)] text-[oklch(0.45_0.12_55)]"
      : "bg-[oklch(0.94_0.04_155)] text-[oklch(0.4_0.12_155)]";

  const reasonData = [
    { key: "lowWage", reason: "임금이 낮아서", pct: terminationReasons.lowWage },
    {
      key: "companyIssue",
      reason: "회사사정이 안 좋아서",
      pct: terminationReasons.companyIssue,
    },
    { key: "dangerous", reason: "일이 힘들거나 위험해서", pct: terminationReasons.dangerous },
    { key: "betterJob", reason: "더 좋은 일자리", pct: terminationReasons.betterJob },
    { key: "environment", reason: "근무환경 불만", pct: terminationReasons.environment },
    { key: "wageDelay", reason: "임금체불", pct: terminationReasons.wageDelay },
    { key: "friend", reason: "아는 사람과 일하고 싶어서", pct: terminationReasons.friend },
    { key: "other", reason: "기타", pct: terminationReasons.other },
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
          <p className="text-[10px] font-medium text-[oklch(0.45_0.12_55)]">귀사 최근 1년 이직률</p>
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

          <div className="space-y-2">
            {reasonData.map((item) => {
              const targetCategory = REASON_TO_CHECKLIST[item.key];
              const clickable = targetCategory != null && onReasonClick != null;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onReasonClick(targetCategory, item.reason)}
                  className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors ${
                    clickable
                      ? "cursor-pointer hover:bg-[oklch(0.97_0.02_55)]"
                      : "cursor-default opacity-50"
                  }`}
                >
                  <span className="w-[100px] shrink-0 truncate text-xs text-[oklch(0.4_0.01_260)]">
                    {item.reason}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-[oklch(0.95_0.01_260)]">
                    <div
                      className="h-full rounded bg-[oklch(0.65_0.18_55)]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] font-semibold text-[oklch(0.4_0.01_260)]">
                    {item.pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 면책 안내 */}
        <p className="text-[10px] text-muted-foreground">
          귀사 이직률과 전국 퇴사사유는 별개 지표입니다. 퇴사사유는 업종 전반의 경향 파악 참고용으로
          제공됩니다.
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
