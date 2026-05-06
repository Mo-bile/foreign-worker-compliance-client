import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";
import { WorkerCompletedHistoryTab } from "@/components/workers/worker-completed-history-tab";

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function renderTab(workerId: number) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <WorkerCompletedHistoryTab workerId={workerId} />
    </QueryClientProvider>,
  );
}

describe("WorkerCompletedHistoryTab", () => {
  it("COMPLETED_데드라인만_completedAt_내림차순으로_표시한다", async () => {
    server.use(
      http.get("*/api/compliance/worker/:id", () =>
        HttpResponse.json([
          {
            id: 1,
            workerId: 5,
            workerName: "X",
            deadlineType: "EXIT_GUARANTEE_INSURANCE",
            dueDate: "2026-01-01",
            status: "COMPLETED",
            description: "이전",
            completedAt: "2026-01-01",
            referenceNumber: "OLD",
          },
          {
            id: 2,
            workerId: 5,
            workerName: "X",
            deadlineType: "EXIT_GUARANTEE_INSURANCE",
            dueDate: "2026-04-15",
            status: "COMPLETED",
            description: "최근",
            completedAt: "2026-04-10",
            referenceNumber: "NEW",
          },
          {
            id: 3,
            workerId: 5,
            workerName: "X",
            deadlineType: "VISA_EXPIRY",
            dueDate: "2027-12-31",
            status: "PENDING",
            description: "비자",
          },
        ]),
      ),
    );

    renderTab(5);

    await waitFor(() => expect(screen.getAllByRole("row").length).toBeGreaterThan(1));
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("NEW");
    expect(rows[2]).toHaveTextContent("OLD");
    expect(screen.queryByText("비자")).not.toBeInTheDocument();
  });

  it("evidenceUrl이_있으면_외부_링크로_표시된다_rel_noopener", async () => {
    server.use(
      http.get("*/api/compliance/worker/:id", () =>
        HttpResponse.json([
          {
            id: 1,
            workerId: 5,
            workerName: "X",
            deadlineType: "EXIT_GUARANTEE_INSURANCE",
            dueDate: "2026-01-01",
            status: "COMPLETED",
            description: "OK",
            completedAt: "2026-01-01",
            evidenceUrl: "https://example.com/policy",
          },
        ]),
      ),
    );

    renderTab(5);

    const link = await screen.findByRole("link", { name: /증빙/ });
    expect(link).toHaveAttribute("href", "https://example.com/policy");
    expect(link).toHaveAttribute("rel", expect.stringMatching(/noopener/));
  });

  it("빈_상태에서_안내_문구를_표시한다", async () => {
    server.use(http.get("*/api/compliance/worker/:id", () => HttpResponse.json([])));

    renderTab(5);

    expect(await screen.findByText("완료된 이력이 없습니다")).toBeInTheDocument();
  });
});
