"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkerResponse, RegisterWorkerRequest } from "@/types/api";
import { paginateItems } from "@/lib/pagination";
import type { PaginatedResult } from "@/lib/pagination";
import { NATIONALITY_LABELS } from "@/types/api";
import type { Nationality } from "@/types/api";

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

export interface WorkerFilterParams {
  readonly page: number;
  readonly search: string;
  readonly visaType: string;
  readonly status: string;
  readonly insuranceStatus: string;
}

export function usePaginatedWorkers(params: WorkerFilterParams): {
  workers: PaginatedResult<WorkerResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await fetch("/api/workers");
      if (!res.ok) throw new Error("근로자 목록을 불러올 수 없습니다");
      return res.json();
    },
  });

  const workers = query.data
    ? paginateItems(filterWorkers(query.data, params), params.page)
    : undefined;

  return { workers, isLoading: query.isLoading, isError: query.isError };
}

function filterWorkers(
  workers: readonly WorkerResponse[],
  params: WorkerFilterParams,
): readonly WorkerResponse[] {
  return workers.filter((worker) => {
    if (params.search.trim() !== "") {
      const searchLower = params.search.toLowerCase();
      const nationalityLabel =
        NATIONALITY_LABELS[worker.nationality as Nationality] ?? worker.nationality;
      const matchesSearch =
        worker.name.toLowerCase().includes(searchLower) ||
        nationalityLabel.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (params.visaType !== "ALL" && worker.visaType !== params.visaType) return false;
    if (params.status !== "ALL" && worker.status !== params.status) return false;

    if (params.insuranceStatus !== "ALL") {
      const hasMatch = worker.insuranceEligibilities.some(
        (ie) => ie.status === params.insuranceStatus,
      );
      if (!hasMatch) return false;
    }

    return true;
  });
}
