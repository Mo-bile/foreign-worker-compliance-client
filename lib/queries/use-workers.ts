"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  WorkerResponse,
  RegisterWorkerRequest,
  VisaType,
  WorkerStatus,
  InsuranceStatus,
  FilterOption,
} from "@/types/api";
import { paginateItems } from "@/lib/pagination";
import type { PaginatedResult } from "@/lib/pagination";
import { NATIONALITY_LABELS } from "@/types/api";

import { throwResponseError } from "./query-utils";

export function useWorkers(companyId?: number | null) {
  return useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers", { companyId }],
    queryFn: async () => {
      const params = companyId ? `?companyId=${companyId}` : "";
      const res = await fetch(`/api/workers${params}`);
      if (!res.ok) await throwResponseError(res, "근로자 목록을 불러올 수 없습니다");
      return res.json();
    },
    enabled: companyId != null && companyId > 0,
  });
}

export function useWorker(id: number) {
  return useQuery<WorkerResponse>({
    queryKey: ["workers", id],
    queryFn: async () => {
      const res = await fetch(`/api/workers/${id}`);
      if (!res.ok) await throwResponseError(res, "근로자 정보를 불러올 수 없습니다");
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
      if (!res.ok) await throwResponseError(res, "등록에 실패했습니다");
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
  readonly visaType: FilterOption<VisaType>;
  readonly status: FilterOption<WorkerStatus>;
  readonly insuranceStatus: FilterOption<InsuranceStatus>;
}

// TODO: 현재 WorkerTable이 자체 필터링/페이지네이션을 수행하므로 프로덕션에서 미사용.
// 서버 사이드 필터링 전환 시 이 훅을 페이지에 연결하고 WorkerTable 내부 필터 로직을 제거할 것.
export function usePaginatedWorkers(
  companyId: number | null | undefined,
  params: WorkerFilterParams,
): {
  workers: PaginatedResult<WorkerResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useWorkers(companyId);

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
      const nationalityLabel = NATIONALITY_LABELS[worker.nationality] ?? worker.nationality;
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
