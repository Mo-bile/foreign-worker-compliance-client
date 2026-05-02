"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  WorkerResponse,
  RegisterWorkerRequest,
  UpdateWorkerRequest,
  SuggestWorkerKoreanNameRequest,
  SuggestWorkerKoreanNameResponse,
  VisaType,
  WorkerStatus,
  InsuranceStatus,
  FilterOption,
} from "@/types/api";
import { paginateItems } from "@/lib/pagination";
import type { PaginatedResult } from "@/lib/pagination";

import { fetchApi, mutateApi, mutateApiVoid } from "./query-utils";

export function useWorkers(companyId?: number | null) {
  return useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers", { companyId }],
    queryFn: () => {
      const params = companyId ? `?companyId=${companyId}` : "";
      return fetchApi<readonly WorkerResponse[]>(
        `/api/workers${params}`,
        "외국인 근로자 목록을 불러올 수 없습니다",
      );
    },
    enabled: companyId != null && companyId > 0,
  });
}

export function useWorker(id: number) {
  return useQuery<WorkerResponse>({
    queryKey: ["workers", id],
    queryFn: () =>
      fetchApi<WorkerResponse>(`/api/workers/${id}`, "근로자 정보를 불러올 수 없습니다"),
    enabled: id > 0,
  });
}

export function useRegisterWorker() {
  const queryClient = useQueryClient();

  return useMutation<WorkerResponse, Error, RegisterWorkerRequest>({
    mutationFn: (data) =>
      mutateApi<WorkerResponse>("/api/workers", "POST", data, "등록에 실패했습니다"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

export function useUpdateWorker(workerId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateWorkerRequest>({
    mutationFn: (data) =>
      mutateApiVoid(`/api/workers/${workerId}`, "PUT", data, "근로자 수정에 실패했습니다"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workers", workerId] });
    },
  });
}

export function useSuggestWorkerKoreanName() {
  return useMutation<SuggestWorkerKoreanNameResponse, Error, SuggestWorkerKoreanNameRequest>({
    mutationFn: (data) =>
      mutateApi<SuggestWorkerKoreanNameResponse>(
        "/api/workers/korean-name/suggest",
        "POST",
        data,
        "한글 이름 추천에 실패했습니다",
      ),
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
      const koreanName = worker.koreanName?.toLowerCase() ?? "";
      const matchesSearch =
        worker.name.toLowerCase().includes(searchLower) ||
        koreanName.includes(searchLower) ||
        worker.nationality.toLowerCase().includes(searchLower);
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
