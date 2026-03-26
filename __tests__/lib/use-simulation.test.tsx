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
    const { result } = renderHook(() => useSimulation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        desiredCount: 3,
        preferredNationality: "VIETNAM",
        preferredPeriod: "2026_H2",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.verdict).toBe("HIGH");
    expect(result.current.data?.analyses.length).toBeGreaterThan(0);
  });
});
