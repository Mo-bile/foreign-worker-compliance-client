"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { EmploymentEndReason } from "@/types/api";
import { toEndReasonDistributionDisplay } from "@/lib/utils/end-reason-distribution";

interface EndReasonDistributionCardProps {
  readonly distribution?: Readonly<Partial<Record<EmploymentEndReason, number>>> | null;
}

export function EndReasonDistributionCard({ distribution }: EndReasonDistributionCardProps) {
  const { items, total, maxCount } = toEndReasonDistributionDisplay(distribution);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">📋 최근 1년 이직 사유 분석</h3>
          <span className="text-xs text-muted-foreground">
            총 {total.toLocaleString("ko-KR")}건
          </span>
        </div>

        {total === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-xs text-muted-foreground">
            최근 1년간 이직 기록이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const widthPct = (item.count / maxCount) * 100;
              return (
                <li key={item.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.count}건 ({item.percentage.toLocaleString("ko-KR")}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[oklch(0.65_0.15_240)] transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                      role="presentation"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[10px] text-muted-foreground">
          ※ 본 통계는 PR-γ 고용종료 처리 결과를 자동 집계합니다. 사유는 사업주가 직접 선택한 값
          기준이며, 사업장 변경(employerFault) 비율이 높은 경우 D36 자동 감점 후보로 노출됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
