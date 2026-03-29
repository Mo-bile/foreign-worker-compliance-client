import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { useSimulation } from "@/lib/queries/use-simulation";

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

describe("useSimulation", () => {
  it("시뮬레이션_요청을_보내고_결과를_반환한다", async () => {
    const { result } = renderHook(() => useSimulation(1), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        desiredWorkers: 3,
        preferredNationality: "VIETNAM",
        desiredTiming: "2026_H2",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.verdict).toBeDefined();
    expect(result.current.data?.analyses.length).toBeGreaterThan(0);
  });

  it("companyId가_null이면_에러를_반환한다", async () => {
    const { result } = renderHook(() => useSimulation(null), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        desiredWorkers: 3,
        desiredTiming: "2026_H2",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("사업장을 먼저 선택해주세요");
  });
});
