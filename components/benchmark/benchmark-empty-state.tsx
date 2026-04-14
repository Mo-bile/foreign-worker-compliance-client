"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BenchmarkEmptyStateProps {
  readonly onCreateBenchmark: () => void;
  readonly isLoading: boolean;
}

export function BenchmarkEmptyState({ onCreateBenchmark, isLoading }: BenchmarkEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-5xl">📋</div>
        <h2 className="text-lg font-semibold">사업장 진단 리포트가 없습니다</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          진단을 실행하면 임금, 고용 안정성, 관리 수준 등을 종합 분석합니다
        </p>
        <Button className="mt-6" onClick={onCreateBenchmark} disabled={isLoading}>
          {isLoading ? "진단 중..." : "사업장 진단 실행"}
        </Button>
      </CardContent>
    </Card>
  );
}
