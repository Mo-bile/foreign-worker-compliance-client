import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";
import { useCompanies, useCompany } from "@/lib/queries/use-companies";
import type { ReactNode } from "react";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCompanies", () => {
  it("사업장_목록을_반환한다", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.length).toBeGreaterThan(0);
  });
});

describe("useCompany", () => {
  it("사업장_상세를_반환한다", async () => {
    const { result } = renderHook(() => useCompany(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(1);
  });

  it("id가_0이면_쿼리를_비활성화한다", () => {
    const { result } = renderHook(() => useCompany(0), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
