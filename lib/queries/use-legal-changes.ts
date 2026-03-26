"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { LegalChangesResponse } from "@/types/legal";

export function useLegalChanges(companyId: number | null | undefined) {
  return useQuery<LegalChangesResponse>({
    queryKey: ["legal-changes", companyId],
    queryFn: () => {
      if (companyId == null || companyId <= 0) {
        return Promise.reject(new Error("유효하지 않은 사업장 ID입니다"));
      }
      return fetchApi<LegalChangesResponse>(
        `/api/legal-changes?companyId=${companyId}`,
        "법령 변경 조회에 실패했습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}
