import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import {
  usePaginatedOverdueDeadlines,
  usePaginatedUpcomingDeadlines,
} from "@/lib/queries/use-compliance";

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

describe("usePaginatedOverdueDeadlines", () => {
  it("필터_없이_첫_페이지를_반환한다", async () => {
    const { result } = renderHook(
      () => usePaginatedOverdueDeadlines({ deadlineType: "ALL", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.deadlines).toBeDefined();
    expect(result.current.deadlines!.currentPage).toBe(1);
    expect(result.current.deadlines!.totalItems).toBe(22);
  });

  it("데드라인_유형_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedOverdueDeadlines({ deadlineType: "VISA_EXPIRY", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.deadlines!.items.every((d) => d.deadlineType === "VISA_EXPIRY"),
    ).toBe(true);
  });

  it("상태_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedOverdueDeadlines({ deadlineType: "ALL", status: "OVERDUE" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.deadlines!.items.every((d) => d.status === "OVERDUE"),
    ).toBe(true);
  });
});

describe("usePaginatedUpcomingDeadlines", () => {
  it("필터_없이_첫_페이지를_반환한다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedUpcomingDeadlines(30, { deadlineType: "ALL", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.deadlines).toBeDefined();
    expect(result.current.deadlines!.currentPage).toBe(1);
    expect(result.current.deadlines!.totalItems).toBe(25);
  });

  it("데드라인_유형_필터가_적용된다", async () => {
    const { result } = renderHook(
      () =>
        usePaginatedUpcomingDeadlines(30, { deadlineType: "CONTRACT_RENEWAL", status: "ALL" }, 1),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.deadlines!.items.every((d) => d.deadlineType === "CONTRACT_RENEWAL"),
    ).toBe(true);
  });
});
