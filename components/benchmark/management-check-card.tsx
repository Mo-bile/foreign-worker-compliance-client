"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ManagementCheck } from "@/types/benchmark";

interface ManagementCheckCardProps {
  readonly managementCheck: ManagementCheck;
}

export function ManagementCheckCard({ managementCheck }: ManagementCheckCardProps) {
  const { totalItems, passedItems, score, items } = managementCheck;
  const failedRequired = items.filter((i) => i.required && !i.passed).length;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">✅ 관리 수준 체크리스트</h3>
          <span className="rounded-full bg-[oklch(0.94_0.04_155)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.4_0.12_155)]">
            {passedItems}/{totalItems}
          </span>
        </div>

        {/* 요약 */}
        <div className="flex items-center gap-3 rounded-lg border border-[oklch(0.82_0.06_155)] bg-[oklch(0.96_0.02_155)] p-3">
          <span className="text-xl font-extrabold text-[oklch(0.4_0.12_155)]">
            {score}점
          </span>
          <div className="text-xs text-[oklch(0.35_0.08_155)]">
            <p>{totalItems}개 항목 중 {passedItems}개 충족</p>
            {failedRequired > 0 && (
              <p className="text-[oklch(0.5_0.18_25)]">
                법적의무 {failedRequired}건 미충족
              </p>
            )}
          </div>
        </div>

        {/* 체크리스트 */}
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 border-b border-[oklch(0.95_0.01_260)] py-1.5 text-xs last:border-b-0"
            >
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  item.passed
                    ? "bg-[oklch(0.9_0.06_155)] text-[oklch(0.4_0.12_155)]"
                    : "bg-[oklch(0.92_0.04_25)] text-[oklch(0.5_0.18_25)]"
                }`}
              >
                {item.passed ? "✓" : "✕"}
              </span>
              <span className="shrink-0 rounded bg-[oklch(0.95_0.01_260)] px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {item.category}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.required && !item.passed && (
                <span className="shrink-0 text-[10px] font-medium text-[oklch(0.5_0.18_25)]">
                  법적의무
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
