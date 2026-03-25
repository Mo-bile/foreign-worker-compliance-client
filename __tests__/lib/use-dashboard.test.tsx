import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { useDashboard } from "@/lib/queries/use-dashboard";

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

describe("useDashboard", () => {
  it("대시보드_데이터를_성공적으로_반환한다", async () => {
    const { result } = renderHook(() => useDashboard(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.stats.totalWorkers).toBe(12);
    expect(result.current.data?.alerts).toHaveLength(3);
    expect(result.current.data?.complianceScore.total).toBe(73);
  });

  it("companyId가_undefined이면_쿼리를_비활성화한다", () => {
    const { result } = renderHook(() => useDashboard(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("companyId가_0이면_쿼리를_비활성화한다", () => {
    const { result } = renderHook(() => useDashboard(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});
