import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import type { ReactNode } from "react";
import { useCompleteDeadline } from "@/lib/queries/use-compliance";

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

describe("useCompleteDeadline", () => {
  it("성공_시_summary와_함께_4개_쿼리를_invalidate한다", async () => {
    server.use(
      http.patch("*/api/compliance/:id/complete", () =>
        HttpResponse.json(
          {
            deadlineId: 42,
            completedAt: "2026-05-06",
            nextDeadlineId: 99,
            nextDeadlineDueDate: "2027-05-06",
            nextDeadlineType: "EXIT_GUARANTEE_INSURANCE",
          },
          { status: 202 },
        ),
      ),
    );

    const { queryClient, wrapper } = createWrapper();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCompleteDeadline(), { wrapper });
    act(() => {
      result.current.mutate({
        id: 42,
        body: { completedAt: "2026-05-06", renewedUntil: "2027-05-06" },
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      deadlineId: 42,
      nextDeadlineId: 99,
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["compliance"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["workers"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["companies"] });
  });

  it("BE_400_시_alertMessage를_에러로_던진다", async () => {
    server.use(
      http.patch("*/api/compliance/:id/complete", () =>
        HttpResponse.json({ alertMessage: "이미 완료된 데드라인" }, { status: 400 }),
      ),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCompleteDeadline(), { wrapper });
    act(() => {
      result.current.mutate({ id: 1, body: { completedAt: "2026-05-06" } });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("이미 완료된 데드라인");
  });
});
