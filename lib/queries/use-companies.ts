"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from "@/types/api";
import { fetchApi, mutateApi } from "./query-utils";

export function useCompanies() {
  return useQuery<readonly CompanyResponse[]>({
    queryKey: ["companies"],
    queryFn: () =>
      fetchApi<readonly CompanyResponse[]>("/api/companies", "사업장 목록을 불러올 수 없습니다"),
  });
}

export function useCompany(id: number) {
  return useQuery<CompanyResponse>({
    queryKey: ["companies", id],
    queryFn: () =>
      fetchApi<CompanyResponse>(`/api/companies/${id}`, "사업장 정보를 불러올 수 없습니다"),
    enabled: id > 0,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, CreateCompanyRequest>({
    mutationFn: (data) =>
      mutateApi<CompanyResponse>("/api/companies", "POST", data, "사업장 등록에 실패했습니다"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, { id: number; data: Partial<UpdateCompanyRequest> }>({
    mutationFn: ({ id, data }) =>
      mutateApi<CompanyResponse>(`/api/companies/${id}`, "PUT", data, "사업장 수정에 실패했습니다"),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", variables.id] });
    },
  });
}
