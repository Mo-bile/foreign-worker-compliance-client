import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import DashboardPage from "@/app/(app)/page";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: 1, companies: [] }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("DashboardPage", () => {
  it("모든_대시보드_섹션을_렌더링한다", async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("등록 근로자")).toBeDefined();
    });

    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
    expect(screen.getByText("보험 가입률")).toBeDefined();
    expect(screen.getByText("긴급 조치 필요")).toBeDefined();

    expect(screen.getByText(/비자 만료 임박/)).toBeDefined();
    expect(screen.getByText(/건강보험 미가입/)).toBeDefined();

    expect(screen.getByText("비자 유형별 분포")).toBeDefined();
    expect(screen.getByText("4대보험 현황")).toBeDefined();
    expect(screen.getByText("AI 인사이트")).toBeDefined();
    expect(screen.getByText("컴플라이언스 점수")).toBeDefined();
    expect(screen.getAllByText("다가오는 데드라인").length).toBeGreaterThan(0);
  });
});
