"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkerResponse, RegisterWorkerRequest } from "@/types/api";

export function useWorkers() {
  return useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await fetch("/api/workers");
      if (!res.ok) throw new Error("근로자 목록을 불러올 수 없습니다");
      return res.json();
    },
  });
}

export function useWorker(id: number) {
  return useQuery<WorkerResponse>({
    queryKey: ["workers", id],
    queryFn: async () => {
      const res = await fetch(`/api/workers/${id}`);
      if (!res.ok) throw new Error("근로자 정보를 불러올 수 없습니다");
      return res.json();
    },
    enabled: id > 0,
  });
}

export function useRegisterWorker() {
  const queryClient = useQueryClient();

  return useMutation<WorkerResponse, Error, RegisterWorkerRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message ?? "등록에 실패했습니다");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}
