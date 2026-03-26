"use client";

import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BenchmarkHeaderProps {
  readonly reportPeriod: string;
}

export function BenchmarkHeader({ reportPeriod }: BenchmarkHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">사업장 건강검진</h1>
        <span className="rounded-full bg-signal-blue-bg px-3 py-1 text-xs font-medium text-signal-blue">
          {reportPeriod} 리포트
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => toast("준비 중입니다")}>
          <Download className="mr-1.5 h-4 w-4" />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast("준비 중입니다")}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          재분석
        </Button>
      </div>
    </div>
  );
}
