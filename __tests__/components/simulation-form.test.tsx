import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimulationForm } from "@/components/simulator/simulation-form";
import type { CompanyResponse } from "@/types/api";

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

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("SimulationForm", () => {
  it("자동입력_정보를_표시한다", () => {
    renderWithQueryClient(
      <SimulationForm company={mockCompany} onSubmit={vi.fn()} isPending={false} />,
    );
    expect(screen.getByText(/경기/)).toBeDefined();
    expect(screen.getByText(/제조업/)).toBeDefined();
  });

  it("필수_입력_필드가_존재한다", () => {
    renderWithQueryClient(
      <SimulationForm company={mockCompany} onSubmit={vi.fn()} isPending={false} />,
    );
    expect(screen.getByLabelText("희망 고용인원")).toBeDefined();
    expect(screen.getByLabelText("희망 시기")).toBeDefined();
  });

  it("제출_시_onSubmit을_호출한다", () => {
    const onSubmit = vi.fn();
    renderWithQueryClient(
      <SimulationForm company={mockCompany} onSubmit={onSubmit} isPending={false} />,
    );

    const countInput = screen.getByLabelText("희망 고용인원");
    fireEvent.change(countInput, { target: { value: "3" } });

    const timingSelect = screen.getByLabelText("희망 시기");
    fireEvent.change(timingSelect, { target: { value: "2026_H2" } });

    const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      desiredWorkers: 3,
      preferredNationality: undefined,
      desiredTiming: "2026_H2",
    });
  });

  it("isPending이면_버튼이_비활성화된다", () => {
    renderWithQueryClient(
      <SimulationForm company={mockCompany} onSubmit={vi.fn()} isPending={true} />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", true);
    expect(screen.getByText("분석 중...")).toBeDefined();
  });

  it("company가_null이면_자동입력_박스를_숨긴다", () => {
    renderWithQueryClient(
      <SimulationForm company={null} onSubmit={vi.fn()} isPending={false} />,
    );
    expect(screen.queryByText(/자동 입력/)).toBeNull();
  });
});
