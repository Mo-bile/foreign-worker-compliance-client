"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { ComplianceReportResponse } from "@/types/report";

export function useComplianceReport(companyId: number | null | undefined) {
  return useQuery<ComplianceReportResponse>({
    queryKey: ["compliance-report", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<ComplianceReportResponse>(
        `/api/reports?companyId=${companyId}`,
        "리포트 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
