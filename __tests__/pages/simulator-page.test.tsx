import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import SimulatorPage from "@/app/(app)/simulator/page";
import type { CompanyResponse } from "@/types/api";

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("SimulatorPage", () => {
  afterEach(() => {
    mockUseCompanyContext.mockReturnValue({
      selectedCompanyId: 1,
      selectedCompany: mockCompany,
      companies: [],
    });
  });

  it("사업장_미선택_시_선택_안내를_렌더링한다", () => {
    mockUseCompanyContext.mockReturnValue({
      selectedCompanyId: null,
      selectedCompany: null,
      companies: [],
    });
    render(<SimulatorPage />, { wrapper: createWrapper() });
    expect(screen.getByText("사업장을 선택해주세요")).toBeDefined();
  });

  it("폼을_렌더링한다", () => {
    render(<SimulatorPage />, { wrapper: createWrapper() });
    expect(screen.getByText("고용 시뮬레이션")).toBeDefined();
    expect(screen.getByLabelText("희망 고용인원")).toBeDefined();
  });

  it("제출_전_빈_상태를_표시한다", () => {
    render(<SimulatorPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/시뮬레이션을 실행하면/)).toBeDefined();
  });

  it("폼_제출_후_결과를_표시한다", async () => {
    render(<SimulatorPage />, { wrapper: createWrapper() });

    const countInput = screen.getByLabelText("희망 고용인원");
    fireEvent.change(countInput, { target: { value: "3" } });

    const periodSelect = screen.getByLabelText("희망 시기");
    fireEvent.change(periodSelect, { target: { value: "2026_H2" } });

    const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("분석 완료")).toBeDefined();
    });

    expect(screen.getAllByText(/높음/).length).toBeGreaterThan(0);
    expect(screen.getByText("배정 가능성")).toBeDefined();
    expect(screen.getByText("쿼터 분석")).toBeDefined();
    expect(screen.getByText("다음 단계 추천")).toBeDefined();
  });

  it("API_에러_시_에러_메시지를_렌더링한다", async () => {
    server.use(
      http.post("*/api/simulations", () =>
        HttpResponse.json(
          { status: 500, error: "Internal Server Error", message: "서버 에러" },
          { status: 500 },
        ),
      ),
    );

    render(<SimulatorPage />, { wrapper: createWrapper() });

    const countInput = screen.getByLabelText("희망 고용인원");
    fireEvent.change(countInput, { target: { value: "3" } });

    const periodSelect = screen.getByLabelText("희망 시기");
    fireEvent.change(periodSelect, { target: { value: "2026_H2" } });

    const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("시뮬레이션 분석에 실패했습니다")).toBeDefined();
    });
  });
});
