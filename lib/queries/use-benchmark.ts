"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { BenchmarkResponse } from "@/types/benchmark";

export function useBenchmark(companyId: number | null | undefined) {
  return useQuery<BenchmarkResponse>({
    queryKey: ["benchmark", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<BenchmarkResponse>(
        `/api/benchmarks?companyId=${companyId}`,
        "벤치마크 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
