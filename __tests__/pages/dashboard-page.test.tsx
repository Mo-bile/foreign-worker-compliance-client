import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import DashboardPage from "@/app/(app)/page";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockUseCompanyContext = vi.fn(() => ({
  selectedCompanyId: 1 as number | null,
  companies: [],
}));

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => mockUseCompanyContext(),
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
  afterEach(() => {
    mockUseCompanyContext.mockReturnValue({ selectedCompanyId: 1, companies: [] });
  });

  it("모든_대시보드_섹션을_렌더링한다", async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("등록 근로자")).toBeDefined();
    });

    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
    expect(screen.getByText("보험 가입률")).toBeDefined();
    expect(screen.getByText("긴급 조치 필요")).toBeDefined();

    expect(screen.getByText(/비자 만료 임박/)).toBeDefined();
    expect(screen.getByText(/보험 가입 필요/)).toBeDefined();

    expect(screen.getByText("비자 유형별 분포")).toBeDefined();
    expect(screen.getByText("4대보험 현황")).toBeDefined();
    expect(screen.getByText("AI 인사이트")).toBeDefined();
    expect(screen.getByText("컴플라이언스 점수")).toBeDefined();
    expect(screen.getAllByText("다가오는 데드라인").length).toBeGreaterThan(0);
  });

  it("사업장_미선택_시_선택_안내를_렌더링한다", () => {
    mockUseCompanyContext.mockReturnValue({ selectedCompanyId: null, companies: [] });

    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText("사업장을 선택해주세요")).toBeDefined();
    expect(screen.getByText(/상단에서 사업장을 먼저 선택/)).toBeDefined();
  });

  it("로딩_중_스켈레톤을_렌더링한다", () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.queryByText("등록 근로자")).toBeNull();
  });

  it("API_에러_시_에러_메시지와_재시도_버튼을_렌더링한다", async () => {
    server.use(
      http.get("*/api/dashboard", () =>
        HttpResponse.json(
          { status: 500, error: "Internal Server Error", message: "서버 에러" },
          { status: 500 },
        ),
      ),
    );

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("대시보드를 불러올 수 없습니다")).toBeDefined();
    });

    expect(screen.getByText("다시 시도")).toBeDefined();
  });
});
