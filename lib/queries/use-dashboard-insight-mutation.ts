"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mutateApi } from "./query-utils";

export function useDashboardInsightMutation(companyId: number) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error>({
    mutationFn: () =>
      mutateApi<unknown>(
        `/api/dashboard/insight?companyId=${companyId}`,
        "POST",
        {},
        "AI 분석에 실패했습니다",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", companyId] });
    },
  });
}
