"use client";

import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BenchmarkHeaderProps {
  readonly analyzedAt: string;
  readonly onCreateBenchmark: () => void;
  readonly isCreating: boolean;
}

export function BenchmarkHeader({
  analyzedAt,
  onCreateBenchmark,
  isCreating,
}: BenchmarkHeaderProps) {
  const date = new Date(analyzedAt);
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">사업장 진단 리포트</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {dateStr} 분석
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("준비 중입니다")}
        >
          <Download className="mr-1.5 h-4 w-4" />
          PDF
        </Button>
        <Button
          size="sm"
          onClick={onCreateBenchmark}
          disabled={isCreating}
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isCreating ? "animate-spin" : ""}`} />
          {isCreating ? "진단 중..." : "재진단"}
        </Button>
      </div>
    </div>
  );
}
