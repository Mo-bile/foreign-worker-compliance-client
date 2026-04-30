import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

  it("전화번호_컬럼을_표시한다", () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    expect(screen.getByRole("columnheader", { name: "전화번호" })).toBeDefined();
    expect(screen.getByText("010-1234-5678")).toBeDefined();
  });

  it("기본_정렬은_상태_오름차순이다_재직중이_먼저_나온다", () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("재직중")).toBeDefined();
  });

  it("상태_헤더_클릭시_정렬_방향이_토글된다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const statusHeader = screen.getByRole("columnheader", { name: "상태 ↑" });
    expect(statusHeader).toBeDefined();
    await userEvent.click(statusHeader);
    expect(screen.getByRole("columnheader", { name: "상태 ↓" })).toBeDefined();
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
    const option = await screen.findByRole("option", { name: "재직중" });
    await userEvent.click(option);
    const activeCount = mockWorkers.filter((w) => w.status === "ACTIVE").length;
    expect(screen.getByText(new RegExp(`총 ${activeCount}건`))).toBeDefined();
  });

  it("필터_변경시_1페이지로_리셋된다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();
    const visaTrigger = screen.getByRole("combobox", { name: "비자 유형 전체" });
    await userEvent.click(visaTrigger);
    const e9Option = await screen.findByRole("option", { name: /E9/ });
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
      w.insuranceEligibilities.some((ie) => ie.status === "EXEMPT"),
    ).length;
    expect(expectedCount).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`총 ${expectedCount}건`))).toBeDefined();
  });

  it("국적_필터에서_베트남을_선택하면_베트남_근로자만_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const nationalityTrigger = screen.getByRole("combobox", { name: "국적 전체" });
    await userEvent.click(nationalityTrigger);
    const option = await screen.findByRole("option", { name: "베트남" });
    await userEvent.click(option);
    const expectedCount = mockWorkers.filter((w) => w.nationality === "VIETNAM").length;
    expect(expectedCount).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`총 ${expectedCount}건`))).toBeDefined();
  });

  it("필터_결과가_빈_경우_조건에_맞는_근로자가_없습니다_메시지를_표시한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const searchInput = screen.getByPlaceholderText("검색어 입력...");
    await userEvent.type(searchInput, "베트남");
    expect(screen.getByText("조건에 맞는 근로자가 없습니다")).toBeDefined();
  });

  it.each([
    ["이름", "Nguyen", "Nguyen Van A"],
    ["전화번호", "01012345678", "Nguyen Van A"],
    ["외국인등록번호", "9503155123456", "Nguyen Van A"],
    ["여권번호", "M12345678", "Nguyen Van A"],
  ])("%s로_검색하면_해당_근로자를_표시한다", async (_label, query, expectedName) => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const searchInput = screen.getByRole("textbox");
    await userEvent.type(searchInput, query);
    expect(screen.getByText(expectedName)).toBeDefined();
    expect(screen.queryByText("Zhang Wei")).toBeNull();
  });

  it("검색_대상을_이름으로_선택하면_전화번호는_검색하지_않는다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const searchTypeTrigger = screen.getByRole("combobox", { name: "전체 검색" });
    await userEvent.click(searchTypeTrigger);
    const nameOption = await screen.findByRole("option", { name: "이름" });
    await userEvent.click(nameOption);

    const searchInput = screen.getByRole("textbox");
    await userEvent.type(searchInput, "01012345678");

    expect(screen.getByText("조건에 맞는 근로자가 없습니다")).toBeDefined();
  });

  it("검색_대상을_전화번호로_선택하면_전화번호로만_검색한다", async () => {
    render(<WorkerTable workers={mockWorkers} isLoading={false} />);
    const searchTypeTrigger = screen.getByRole("combobox", { name: "전체 검색" });
    await userEvent.click(searchTypeTrigger);
    const phoneOption = await screen.findByRole("option", { name: "전화번호" });
    await userEvent.click(phoneOption);

    const searchInput = screen.getByRole("textbox");
    await userEvent.type(searchInput, "01012345678");

    expect(screen.getByText("Nguyen Van A")).toBeDefined();
    expect(screen.queryByText("Zhang Wei")).toBeNull();
  });
});
