"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, patchApi } from "./query-utils";
import type {
  ComplianceDeadlineResponse,
  DeadlineType,
  DeadlineStatus,
  FilterOption,
} from "@/types/api";
import { paginateItems } from "@/lib/pagination";
import type { PaginatedResult } from "@/lib/pagination";

export function useOverdueDeadlines(companyId?: number | null) {
  const params = new URLSearchParams();
  if (companyId != null && companyId > 0) {
    params.set("companyId", String(companyId));
  }
  const queryString = params.toString();

  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "overdue", { companyId }],
    queryFn: () =>
      fetchApi<readonly ComplianceDeadlineResponse[]>(
        `/api/compliance/overdue${queryString ? `?${queryString}` : ""}`,
        "기한초과 데이터를 불러올 수 없습니다",
      ),
    refetchInterval: 30_000,
    enabled: companyId != null && companyId > 0,
  });
}

export function useUpcomingDeadlines(days: number = 30, companyId?: number | null) {
  const params = new URLSearchParams();
  if (companyId != null && companyId > 0) {
    params.set("companyId", String(companyId));
  }
  params.set("days", String(days));

  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "upcoming", days, { companyId }],
    queryFn: () =>
      fetchApi<readonly ComplianceDeadlineResponse[]>(
        `/api/compliance/upcoming?${params.toString()}`,
        "임박 데드라인을 불러올 수 없습니다",
      ),
    refetchInterval: 30_000,
    enabled: companyId != null && companyId > 0 && Number.isFinite(days) && days > 0,
  });
}

export function useWorkerDeadlines(workerId: number) {
  return useQuery<readonly ComplianceDeadlineResponse[]>({
    queryKey: ["compliance", "worker", workerId],
    queryFn: () =>
      fetchApi<readonly ComplianceDeadlineResponse[]>(
        `/api/compliance/worker/${workerId}`,
        "데드라인 정보를 불러올 수 없습니다",
      ),
    enabled: workerId > 0,
  });
}

export interface ComplianceFilterValues {
  readonly deadlineType: FilterOption<DeadlineType>;
  readonly status: FilterOption<DeadlineStatus>;
}

function filterDeadlines(
  deadlines: readonly ComplianceDeadlineResponse[],
  filters: ComplianceFilterValues,
): readonly ComplianceDeadlineResponse[] {
  return deadlines.filter((d) => {
    if (filters.deadlineType !== "ALL" && d.deadlineType !== filters.deadlineType) return false;
    if (filters.status !== "ALL" && d.status !== filters.status) return false;
    return true;
  });
}

export function usePaginatedOverdueDeadlines(
  companyId: number | null,
  filters: ComplianceFilterValues,
  page: number,
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useOverdueDeadlines(companyId);

  const deadlines = query.data
    ? paginateItems(filterDeadlines(query.data, filters), page)
    : undefined;

  return { deadlines, isLoading: query.isLoading, isError: query.isError };
}

export function usePaginatedUpcomingDeadlines(
  days: number,
  companyId: number | null,
  filters: ComplianceFilterValues,
  page: number,
): {
  deadlines: PaginatedResult<ComplianceDeadlineResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useUpcomingDeadlines(days, companyId);

  const deadlines = query.data
    ? paginateItems(filterDeadlines(query.data, filters), page)
    : undefined;

  return { deadlines, isLoading: query.isLoading, isError: query.isError };
}

export function useCompleteDeadline() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (deadlineId) =>
      patchApi(`/api/compliance/${deadlineId}/complete`, "데드라인 완료 처리에 실패했습니다"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance"] });
    },
  });
}
