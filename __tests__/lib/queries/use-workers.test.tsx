import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import type { ReactNode } from "react";
import { useUpdateWorker } from "@/lib/queries/use-workers";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

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

const validUpdate = {
  name: "NGUYEN VAN AN",
  koreanName: "응우옌",
  dateOfBirth: "1995-03-15",
  contactPhone: "010-0000-0000",
  contactEmail: "a@b.com",
  nationality: "VIETNAM" as const,
  visaType: "E9" as const,
  visaExpiryDate: "2027-12-31",
  contractStartDate: "2025-03-01",
  contractEndDate: "",
  jobPosition: "",
  passportNumber: "M12345678",
  registrationNumber: "950315-1234567",
  entryDate: "2024-06-15",
};

describe("useUpdateWorker", () => {
  it("성공_시_workers_compliance_dashboard를_invalidate한다", async () => {
    server.use(
      http.put(`${BACKEND}/api/workers/:id`, () => new HttpResponse(null, { status: 204 })),
      http.put("*/api/workers/:id", () => new HttpResponse(null, { status: 204 })),
    );
    const { queryClient, wrapper } = createWrapper();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateWorker(1), { wrapper });
    act(() => {
      result.current.mutate(validUpdate);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(spy).toHaveBeenCalledWith({ queryKey: ["workers"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["compliance"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
  });
});
