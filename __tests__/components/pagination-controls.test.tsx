import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationControls } from "@/components/ui/pagination-controls";

describe("PaginationControls", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 3,
    totalItems: 55,
    pageSize: 20,
    onPageChange: vi.fn(),
  };

  it("총_항목_범위를_표시한다", () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByText("총 55건 중 1-20")).toBeDefined();
  });

  it("2페이지의_항목_범위를_올바르게_표시한다", () => {
    render(<PaginationControls {...defaultProps} currentPage={2} />);
    expect(screen.getByText("총 55건 중 21-40")).toBeDefined();
  });

  it("마지막_페이지의_항목_범위를_올바르게_표시한다", () => {
    render(<PaginationControls {...defaultProps} currentPage={3} />);
    expect(screen.getByText("총 55건 중 41-55")).toBeDefined();
  });

  it("첫_페이지에서_이전_버튼이_비활성이다", () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
  });

  it("마지막_페이지에서_다음_버튼이_비활성이다", () => {
    render(<PaginationControls {...defaultProps} currentPage={3} />);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("다음_버튼_클릭시_onPageChange를_호출한다", async () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("페이지_번호_클릭시_onPageChange를_호출한다", async () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3 페이지" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("총_페이지가_7_이하면_모든_페이지를_표시한다", () => {
    render(<PaginationControls {...defaultProps} totalPages={7} totalItems={140} />);
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByRole("button", { name: `${i} 페이지` })).toBeDefined();
    }
  });

  it("총_페이지가_8_이상이면_말줄임을_표시한다", () => {
    render(
      <PaginationControls
        {...defaultProps}
        currentPage={5}
        totalPages={10}
        totalItems={200}
      />,
    );
    expect(screen.getByRole("button", { name: "1 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "4 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "5 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "6 페이지" })).toBeDefined();
    expect(screen.getByRole("button", { name: "10 페이지" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "3 페이지" })).toBeNull();
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(2);
  });

  it("totalPages가_0이면_렌더링하지_않는다", () => {
    const { container } = render(
      <PaginationControls {...defaultProps} totalPages={0} totalItems={0} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
