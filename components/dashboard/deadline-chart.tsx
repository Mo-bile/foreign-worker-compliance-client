"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComplianceDeadlineResponse } from "@/types/api";

interface DeadlineChartProps {
  readonly deadlines: readonly ComplianceDeadlineResponse[] | undefined;
  readonly isLoading: boolean;
  readonly isError?: boolean;
}

export function DeadlineChart({ deadlines, isLoading, isError }: DeadlineChartProps) {
  const chartData = useMemo(() => {
    if (!deadlines) return [];

    const grouped = new Map<string, number>();
    for (const d of deadlines) {
      const count = grouped.get(d.dueDate) ?? 0;
      grouped.set(d.dueDate, count + 1);
    }

    return Array.from(grouped.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [deadlines]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">임박 데드라인 분포 (30일)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isError ? (
          <p className="text-destructive text-sm py-8 text-center">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">데이터가 없습니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="건수" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
