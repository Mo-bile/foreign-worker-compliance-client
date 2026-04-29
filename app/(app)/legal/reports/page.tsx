"use client";

import { useState } from "react";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useComplianceReport } from "@/lib/queries/use-compliance-report";
import { ExportButtons } from "@/components/report/export-buttons";
import { Disclaimer } from "@/components/report/disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SignalTone = {
  readonly textClass: string;
  readonly badgeClass: string;
  readonly colorVar: `var(--signal-${string})`;
};

const SCORE_TONES: readonly [min: number, tone: SignalTone][] = [
  [
    90,
    {
      textClass: "text-signal-green",
      badgeClass: "bg-signal-green-bg text-signal-green",
      colorVar: "var(--signal-green)",
    },
  ],
  [
    70,
    {
      textClass: "text-signal-orange",
      badgeClass: "bg-signal-orange-bg text-signal-orange",
      colorVar: "var(--signal-orange)",
    },
  ],
  [
    50,
    {
      textClass: "text-signal-yellow",
      badgeClass: "bg-signal-yellow-bg text-signal-yellow",
      colorVar: "var(--signal-yellow)",
    },
  ],
  [
    Number.NEGATIVE_INFINITY,
    {
      textClass: "text-signal-red",
      badgeClass: "bg-signal-red-bg text-signal-red",
      colorVar: "var(--signal-red)",
    },
  ],
];

function getSignalTone(score: number): SignalTone {
  return SCORE_TONES.find(([min]) => score >= min)?.[1] ?? SCORE_TONES[SCORE_TONES.length - 1][1];
}

function getYearMonthValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(base: Date, offset: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function formatYearMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${year}년 ${Number(month)}월`;
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function formatSnapshot(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildYearMonthOptions() {
  const currentMonth = new Date();
  const currentStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

  return [
    ...Array.from({ length: 6 }, (_, index) => {
      const value = getYearMonthValue(shiftMonth(currentStart, -index));
      return {
        value,
        label: `${formatYearMonthLabel(value)}${index === 0 ? " (현재)" : ""}`,
        disabled: false,
      };
    }),
    ...Array.from({ length: 2 }, (_, index) => {
      const value = getYearMonthValue(shiftMonth(currentStart, index + 1));
      return {
        value,
        label: `${formatYearMonthLabel(value)} (예정)`,
        disabled: true,
      };
    }),
  ];
}

function getMonthToMonthChangeClass(change: number | null): string {
  if (change === null || change === 0) {
    return "bg-signal-gray-bg text-signal-gray";
  }
  return change > 0 ? "bg-signal-green-bg text-signal-green" : "bg-signal-red-bg text-signal-red";
}

function formatMonthToMonthChange(change: number | null): string {
  if (change === null) {
    return "이전 달 데이터 없음";
  }

  const sign = change > 0 ? "+" : "";
  return `전월 대비 ${sign}${formatScore(change)}점`;
}

export default function ReportsPage() {
  const { selectedCompanyId } = useCompanyContext();
  const [yearMonth, setYearMonth] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, error, refetch } = useComplianceReport(
    selectedCompanyId,
    yearMonth,
  );
  const selectedYearMonth = yearMonth ?? data?.yearMonth;
  const yearMonthOptions = buildYearMonthOptions();

  if (selectedCompanyId == null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">사업장을 선택해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          컴플라이언스 리포트를 확인하려면 상단에서 사업장을 먼저 선택해야 합니다.
        </p>
      </div>
    );
  }

  if (isLoading) return <ReportSkeleton />;

  if (isError) {
    const is404 = error?.message?.includes("404") || error?.message?.includes("not found");
    if (is404) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <CardTitle>통합 컴플라이언스 점수</CardTitle>
                <div className="w-full md:w-56">
                  <Select value={selectedYearMonth} onValueChange={setYearMonth}>
                    <SelectTrigger className="w-full" aria-label="기준 월 선택">
                      <SelectValue placeholder="기준 월 선택">{yearMonthOptions.find((o) => o.value === selectedYearMonth)?.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {yearMonthOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                해당 월의 리포트가 없습니다. 다른 월을 선택해주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">리포트 조회에 실패했습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-xs text-primary hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) return <ReportSkeleton />;

  const scoreTone = getSignalTone(data.monthlyComplianceScore);

  return (
    <div className="space-y-6">
      <Card className="overflow-visible">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle>통합 컴플라이언스 점수</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatYearMonthLabel(data.yearMonth)} 기준 사업장의 월간 준수 현황입니다.
              </p>
            </div>
            <div className="w-full md:w-56">
              <Select value={selectedYearMonth} onValueChange={setYearMonth}>
                <SelectTrigger className="w-full" aria-label="기준 월 선택">
                  <SelectValue placeholder="기준 월 선택">{yearMonthOptions.find((o) => o.value === selectedYearMonth)?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {yearMonthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="rounded-2xl border bg-muted/30 p-6">
              <p className="text-sm font-medium text-muted-foreground">월간 점수</p>
              <div className="mt-4 flex items-end gap-3">
                <p className={cn("text-6xl font-semibold tracking-tight", scoreTone.textClass)}>
                  {formatScore(data.monthlyComplianceScore)}
                </p>
                <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    scoreTone.badgeClass,
                  )}
                >
                  {formatYearMonthLabel(data.yearMonth)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    getMonthToMonthChangeClass(data.monthToMonthChange),
                  )}
                >
                  {formatMonthToMonthChange(data.monthToMonthChange)}
                </span>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                스냅샷 기준 시각: {formatSnapshot(data.snapshottedAt)}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-5">
                <h2 className="text-sm font-semibold">세부 항목</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  보험 및 데드라인 준수 현황을 100점 기준으로 집계했습니다.
                </p>
              </div>
              <div className="space-y-5">
                <BreakdownBar label="보험" value={data.breakdown.insurance} />
                <BreakdownBar label="데드라인" value={data.breakdown.deadline} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExportButtons />
      <Disclaimer />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[360px] rounded-xl" />
      <div className="flex justify-center gap-3">
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <Skeleton className="mx-auto h-4 w-72 rounded-md" />
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const tone = getSignalTone(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn("text-sm font-semibold", tone.textClass)}>{formatScore(value)}점</span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--signal-gray-bg)" }}
      >
        <div
          className="h-full rounded-full transition-[width]"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: tone.colorVar,
          }}
        />
      </div>
    </div>
  );
}
