import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import type { ReactNode } from "react";

import { useDashboardInsightMutation } from "@/lib/queries/use-dashboard-insight-mutation";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useDashboardInsightMutation", () => {
  it("성공_시_dashboard_쿼리를_invalidate한다", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDashboardInsightMutation(1), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dashboard", 1] });
  });

  it("실패_시_toast_error를_호출한다", async () => {
    server.use(
      http.post("*/api/dashboard/insight", () =>
        HttpResponse.json({ message: "LLM 호출 실패" }, { status: 500 }),
      ),
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDashboardInsightMutation(1), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
