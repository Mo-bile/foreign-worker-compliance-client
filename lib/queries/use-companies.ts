"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from "@/types/api";

async function throwResponseError(res: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage;
  try {
    const body = await res.json();
    if (body.message) message = body.message;
  } catch {
    // Non-JSON error response — use fallback message
  }
  throw Object.assign(new Error(message), { status: res.status });
}

export function useCompanies() {
  return useQuery<readonly CompanyResponse[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) await throwResponseError(res, "사업장 목록을 불러올 수 없습니다");
      return res.json();
    },
  });
}

export function useCompany(id: number) {
  return useQuery<CompanyResponse>({
    queryKey: ["companies", id],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) await throwResponseError(res, "사업장 정보를 불러올 수 없습니다");
      return res.json();
    },
    enabled: id > 0,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, CreateCompanyRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let message = "사업장 등록에 실패했습니다";
        try {
          const body = await res.json();
          if (body.message) message = body.message;
        } catch (e) {
          console.warn("Failed to parse error response body:", e);
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, { id: number; data: UpdateCompanyRequest }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let message = "사업장 수정에 실패했습니다";
        try {
          const body = await res.json();
          if (body.message) message = body.message;
        } catch (e) {
          console.warn("Failed to parse error response body:", e);
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", variables.id] });
    },
  });
}
