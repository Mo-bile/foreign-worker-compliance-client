"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationLog, TriggerResponse } from "@/types/notification";
import { fetchApi, mutateApi } from "./query-utils";

export function useNotificationLogs(companyId: number | null) {
  return useQuery<readonly NotificationLog[]>({
    queryKey: ["notification-logs", companyId],
    queryFn: () =>
      fetchApi<readonly NotificationLog[]>(
        `/api/notifications/logs?companyId=${companyId}&limit=10`,
        "발송 기록을 불러올 수 없습니다",
      ),
    enabled: companyId != null && companyId > 0,
  });
}

export function useTriggerNotification() {
  const queryClient = useQueryClient();

  return useMutation<TriggerResponse, Error, { companyId: number }>({
    mutationFn: ({ companyId }) =>
      mutateApi<TriggerResponse>(
        `/api/notifications/trigger?companyId=${companyId}`,
        "POST",
        {},
        "알림 발송에 실패했습니다",
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notification-logs", variables.companyId],
      });
    },
  });
}
