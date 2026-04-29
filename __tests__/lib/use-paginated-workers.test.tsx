import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { usePaginatedWorkers } from "@/lib/queries/use-workers";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePaginatedWorkers", () => {
  it("첫_페이지_20건을_반환한다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers(1, {
          page: 1,
          search: "",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(result.current.workers!.items.length).toBeGreaterThan(0);
    expect(result.current.workers!.currentPage).toBe(1);
  });

  it("이름으로_검색_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers(1, {
          page: 1,
          search: "Nguyen",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) => w.name.toLowerCase().includes("nguyen")),
    ).toBe(true);
  });

  it("국적_코드로_검색_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers(1, {
          page: 1,
          search: "VIETNAM",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(result.current.workers!.items.length).toBeGreaterThan(0);
    expect(result.current.workers!.items.every((w) => w.nationality === "VIETNAM")).toBe(true);
  });

  it("비자_유형_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers(1, {
          page: 1,
          search: "",
          visaType: "E9",
          status: "ALL",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(result.current.workers!.items.every((w) => w.visaType === "E9")).toBe(true);
  });

  it("상태_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers(1, {
          page: 1,
          search: "",
          visaType: "ALL",
          status: "ACTIVE",
          insuranceStatus: "ALL",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(result.current.workers!.items.every((w) => w.status === "ACTIVE")).toBe(true);
  });

  it("보험_상태_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedWorkers(1, {
          page: 1,
          search: "",
          visaType: "ALL",
          status: "ALL",
          insuranceStatus: "EXEMPT",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.workers).toBeDefined();
    expect(
      result.current.workers!.items.every((w) =>
        w.insuranceEligibilities.some((ie) => ie.status === "EXEMPT"),
      ),
    ).toBe(true);
  });
});
