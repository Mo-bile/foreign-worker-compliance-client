"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { DashboardResponse } from "@/types/dashboard";

export function useDashboard(companyId: number | undefined) {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard", companyId],
    queryFn: () =>
      fetchApi<DashboardResponse>(
        `/api/dashboard?companyId=${companyId}`,
        "대시보드 데이터를 불러올 수 없습니다",
      ),
    enabled: companyId !== undefined && companyId > 0,
    refetchInterval: 30_000,
  });
}
