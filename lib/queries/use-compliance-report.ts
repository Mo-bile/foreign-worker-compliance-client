"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { ComplianceReport } from "@/types/compliance-report";

export function useComplianceReport(companyId: number | null | undefined, yearMonth?: string) {
  return useQuery<ComplianceReport>({
    queryKey: ["compliance-report", companyId, yearMonth],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }

      const searchParams = new URLSearchParams({ companyId: String(companyId) });
      if (yearMonth) {
        searchParams.set("yearMonth", yearMonth);
      }

      return fetchApi<ComplianceReport>(
        `/api/compliance-report?${searchParams.toString()}`,
        "준수 현황 리포트 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
