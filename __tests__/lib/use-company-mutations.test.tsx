import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/use-companies";
import type { ReactNode } from "react";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const validCreateData = {
  name: "테스트 회사",
  businessNumber: "111-22-33333",
  region: "SEOUL" as const,
  industryCategory: "MANUFACTURING" as const,
  employeeCount: 50,
  foreignWorkerCount: 10,
  address: "서울시 강남구",
  contactPhone: "02-1234-5678",
};

const validUpdateData = {
  name: "수정된 회사",
  region: "BUSAN" as const,
  industryCategory: "CONSTRUCTION" as const,
  employeeCount: 60,
  foreignWorkerCount: 15,
  address: "부산시 해운대구",
  contactPhone: "051-9876-5432",
};

describe("useCreateCompany", () => {
  it("사업장을_생성하고_CompanyResponse를_반환한다", async () => {
    const { result } = renderHook(() => useCreateCompany(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(validCreateData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBeDefined();
    expect(result.current.data?.name).toBe(validCreateData.name);
  });

  it("서버_에러_시_에러_메시지를_전파한다", async () => {
    server.use(
      http.post("*/api/companies", () =>
        HttpResponse.json({ message: "사업자번호가 이미 존재합니다" }, { status: 409 }),
      ),
    );

    const { result } = renderHook(() => useCreateCompany(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(validCreateData);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("사업자번호가 이미 존재합니다");
  });
});

describe("useUpdateCompany", () => {
  it("사업장을_수정하고_CompanyResponse를_반환한다", async () => {
    const { result } = renderHook(() => useUpdateCompany(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ id: 1, data: validUpdateData });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe(validUpdateData.name);
  });

  it("존재하지_않는_사업장_수정_시_에러를_전파한다", async () => {
    const { result } = renderHook(() => useUpdateCompany(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ id: 999, data: validUpdateData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("사업장을 찾을 수 없습니다");
  });
});
