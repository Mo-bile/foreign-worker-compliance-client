"use client";

import { useQuery } from "@tanstack/react-query";
import type { ComplianceDeadlineResponse } from "@/types/api";

export function useOverdueDeadlines() {
  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "overdue"],
    queryFn: async () => {
      const res = await fetch("/api/compliance/overdue");
      if (!res.ok) throw new Error("기한초과 데이터를 불러올 수 없습니다");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useUpcomingDeadlines(days: number = 30) {
  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "upcoming", days],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/upcoming?days=${days}`);
      if (!res.ok) throw new Error("임박 데드라인을 불러올 수 없습니다");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useWorkerDeadlines(workerId: number) {
  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "worker", workerId],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/worker/${workerId}`);
      if (!res.ok) throw new Error("데드라인 정보를 불러올 수 없습니다");
      return res.json();
    },
    enabled: workerId > 0,
  });
}
