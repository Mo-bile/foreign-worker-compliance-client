import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkerTable } from "@/components/workers/worker-table";
import { mockWorkers } from "@/mocks/data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("WorkerTable", () => {
  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<WorkerTable workers={[]} isLoading={true} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("25건_근로자를_첫_페이지_20건으로_표시한다", () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    expect(screen.getByText(/총 25건 중 1-20/)).toBeDefined();
  });

  it("다음_페이지로_이동하면_나머지_5건을_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();
  });

  it("상태_필터에서_ACTIVE를_선택하면_ACTIVE만_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const statusTrigger = screen.getByRole("combobox", { name: "상태 전체" });
    await userEvent.click(statusTrigger);
    const option = screen.getByRole("option", { name: "재직중" });
    await userEvent.click(option);
    const activeCount = mockWorkers.filter((w) => w.statusCode === "ACTIVE").length;
    expect(screen.getByText(new RegExp(`총 ${activeCount}건`))).toBeDefined();
  });

  it("필터_변경시_1페이지로_리셋된다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();
    const visaTrigger = screen.getByRole("combobox", { name: "비자 유형 전체" });
    await userEvent.click(visaTrigger);
    const e9Option = screen.getByRole("option", { name: /E9/ });
    await userEvent.click(e9Option);
    expect(screen.getByText(/총 \d+건 중 1-/)).toBeDefined();
  });

  it("빈_데이터일_때_등록된_근로자가_없습니다_메시지를_표시한다", () => {
    render(<WorkerTable workers={[]} isLoading={false} />);
    expect(screen.getByText("등록된 근로자가 없습니다")).toBeDefined();
  });

  it("보험_상태_필터에서_가입제외를_선택하면_가입제외_보험이_있는_근로자만_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const insuranceTrigger = screen.getByRole("combobox", { name: "보험 상태 전체" });
    await userEvent.click(insuranceTrigger);
    const option = await screen.findByRole("option", { name: "가입제외" });
    await userEvent.click(option);
    const expectedCount = mockWorkers.filter((w) =>
      w.insuranceEligibilities.some((ie) => ie.statusCode === "EXEMPT"),
    ).length;
    expect(expectedCount).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`총 ${expectedCount}건`))).toBeDefined();
  });

  it("필터_결과가_빈_경우_조건에_맞는_근로자가_없습니다_메시지를_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const searchInput = screen.getByPlaceholderText("이름 또는 국적으로 검색...");
    await userEvent.type(searchInput, "존재하지않는이름XYZXYZ");
    expect(screen.getByText("조건에 맞는 근로자가 없습니다")).toBeDefined();
  });
});
