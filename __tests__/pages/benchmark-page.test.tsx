import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import BenchmarkPage from "@/app/(app)/benchmark/page";
import type { CompanyResponse } from "@/types/api";
import { http, HttpResponse } from "msw";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockCompany: CompanyResponse = {
  id: 1,
  name: "테스트 제조",
  businessNumber: "123-45-67890",
  region: "GYEONGGI",
  regionName: "경기",
  subRegion: null,
  industryCategory: "MANUFACTURING",
  industryCategoryName: "제조업",
  industrySubCategory: null,
  employeeCount: 45,
  foreignWorkerCount: 12,
  address: "경기도 안산시",
  contactPhone: "031-123-4567",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockUseCompanyContext = vi.fn(() => ({
  selectedCompanyId: 1 as number | null,
  selectedCompany: mockCompany as CompanyResponse | null,
  companies: [] as CompanyResponse[],
}));

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => mockUseCompanyContext(),
}));

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("BenchmarkPage", () => {
  afterEach(() => {
    mockUseCompanyContext.mockReturnValue({
      selectedCompanyId: 1,
      selectedCompany: mockCompany,
      companies: [],
    });
  });

  it("사업장_미선택_시_안내_메시지를_표시한다", () => {
    mockUseCompanyContext.mockReturnValue({
      selectedCompanyId: null,
      selectedCompany: null,
      companies: [],
    });
    render(<BenchmarkPage />, { wrapper: createWrapper() });
    expect(screen.getByText("사업장을 선택해주세요")).toBeDefined();
  });

  it("데이터_로드_후_전체_리포트를_렌더링한다", async () => {
    render(<BenchmarkPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("사업장 건강검진")).toBeDefined();
    });

    expect(screen.getAllByText("73").length).toBeGreaterThan(0);
    expect(screen.getByText("B+")).toBeDefined();
    expect(screen.getAllByText("임금 경쟁력").length).toBeGreaterThan(0);
    expect(screen.getByText("인력 유출 위험")).toBeDefined();
    expect(screen.getByText("외국인 의존도")).toBeDefined();
    expect(screen.getByText("점수 추이")).toBeDefined();
  });

  it("API_에러_시_에러_메시지를_렌더링한다", async () => {
    server.use(
      http.get("*/api/benchmarks", () =>
        HttpResponse.json(
          { status: 500, error: "Internal Server Error", message: "서버 에러" },
          { status: 500 },
        ),
      ),
    );

    render(<BenchmarkPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("벤치마크 조회에 실패했습니다")).toBeDefined();
    });
  });
});
