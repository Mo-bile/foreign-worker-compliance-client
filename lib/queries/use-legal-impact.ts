"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { LegalImpact } from "@/types/legal";

export function useLegalImpact(
  changeId: number,
  companyId: number | null | undefined,
  enabled: boolean,
) {
  return useQuery<LegalImpact>({
    queryKey: ["legal-impact", changeId, companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<LegalImpact>(
        `/api/legal-changes/${changeId}/impacts?companyId=${companyId}`,
        "영향 분석 조회에 실패했습니다",
      );
    },
    enabled: enabled && companyId != null && companyId > 0,
  });
}
