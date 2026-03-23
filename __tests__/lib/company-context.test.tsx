import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { CompanyProvider, useCompanyContext } from "@/lib/contexts/company-context";
import { mockCompanies } from "@/mocks/data";
import type { ReactNode } from "react";

const STORAGE_KEY = "fwc-selected-company-id";

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CompanyProvider>{children}</CompanyProvider>
      </QueryClientProvider>
    );
  };
}

describe("CompanyContext", () => {
  it("사업장_목록_로드_후_첫번째를_자동선택한다", async () => {
    const { result } = renderHook(() => useCompanyContext(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedCompanyId).toBe(mockCompanies[0].id);
    expect(result.current.selectedCompany?.name).toBe(mockCompanies[0].name);
  });

  it("localStorage에_저장된_유효한_id를_복원한다", async () => {
    localStorage.setItem(STORAGE_KEY, String(mockCompanies[1].id));
    const { result } = renderHook(() => useCompanyContext(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedCompanyId).toBe(mockCompanies[1].id);
  });

  it("localStorage에_저장된_id가_목록에_없으면_첫번째를_자동선택한다", async () => {
    localStorage.setItem(STORAGE_KEY, "999");
    const { result } = renderHook(() => useCompanyContext(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedCompanyId).toBe(mockCompanies[0].id);
  });

  it("setSelectedCompanyId로_선택하면_localStorage에_저장된다", async () => {
    const { result } = renderHook(() => useCompanyContext(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedCompanyId(mockCompanies[2].id);
    });

    expect(result.current.selectedCompanyId).toBe(mockCompanies[2].id);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(mockCompanies[2].id));
  });

  it("사업장_목록이_비어있으면_selectedCompanyId가_null이다", async () => {
    server.use(http.get("*/api/companies", () => HttpResponse.json([])));
    const { result } = renderHook(() => useCompanyContext(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedCompanyId).toBeNull();
    expect(result.current.selectedCompany).toBeNull();
  });

  it("API_에러_시_isError가_true이다", async () => {
    server.use(http.get("*/api/companies", () => HttpResponse.json({ message: "서버 오류" }, { status: 500 })));
    const { result } = renderHook(() => useCompanyContext(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("Provider_없이_호출하면_에러를_던진다", () => {
    expect(() => {
      renderHook(() => useCompanyContext());
    }).toThrow("useCompanyContext must be used within CompanyProvider");
  });
});
