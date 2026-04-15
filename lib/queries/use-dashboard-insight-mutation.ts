"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    onError: (error) => {
      toast.error(error.message || "분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });
}
