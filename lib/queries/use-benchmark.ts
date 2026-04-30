"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, mutateApi } from "./query-utils";
import type { BenchmarkResponse } from "@/types/benchmark";

export function useBenchmarkList(companyId: number | null | undefined) {
  return useQuery<BenchmarkResponse[]>({
    queryKey: ["benchmarks", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<BenchmarkResponse[]>(
        `/api/benchmarks?companyId=${companyId}`,
        "비교 진단 이력 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}

export function useBenchmarkDetail(id: number | null | undefined) {
  return useQuery<BenchmarkResponse>({
    queryKey: ["benchmark", id],
    queryFn: () => {
      if (id == null) {
        return Promise.reject(new Error("유효하지 않은 비교 진단 ID입니다"));
      }
      return fetchApi<BenchmarkResponse>(
        `/api/benchmarks/${id}`,
        "비교 진단 상세 조회에 실패했습니다",
      );
    },
    enabled: id != null,
  });
}

export function useCreateBenchmark() {
  const queryClient = useQueryClient();
  return useMutation<BenchmarkResponse, Error, { companyId: number }>({
    mutationFn: (data) =>
      mutateApi<BenchmarkResponse>("/api/benchmarks", "POST", data, "비교 진단 생성에 실패했습니다"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
    },
  });
}
