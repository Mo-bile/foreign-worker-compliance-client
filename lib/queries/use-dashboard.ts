"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { DashboardResponse } from "@/types/dashboard";

export function useDashboard(companyId: number | null | undefined) {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<DashboardResponse>(
        `/api/dashboard?companyId=${companyId}`,
        "대시보드 데이터를 불러올 수 없습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
