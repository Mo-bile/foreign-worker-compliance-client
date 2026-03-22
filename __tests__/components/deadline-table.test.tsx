import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import type { ComplianceDeadlineResponse } from "@/types/api";

const testDeadlines: ComplianceDeadlineResponse[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  workerId: (i % 5) + 1,
  deadlineType: "VISA_EXPIRY" as const,
  dueDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
  status: "OVERDUE" as const,
  description: `테스트 데드라인 ${i + 1}`,
}));

describe("DeadlineTable", () => {
  it("limit이_있으면_해당_건수만_표시하고_페이지네이션_미표시", () => {
    render(<DeadlineTable title="테스트" deadlines={testDeadlines} isLoading={false} limit={5} />);
    expect(screen.getAllByText(/테스트 데드라인/)).toHaveLength(5);
    expect(screen.queryByLabelText("다음 페이지")).toBeNull();
  });

  it("limit_없으면_내부_페이지네이션이_동작한다", async () => {
    render(<DeadlineTable title="테스트" deadlines={testDeadlines} isLoading={false} />);
    expect(screen.getByText(/총 25건 중 1-20/)).toBeDefined();
    expect(screen.getByLabelText("다음 페이지")).toBeDefined();
    await userEvent.click(screen.getByLabelText("다음 페이지"));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeDefined();
  });

  it("pagination_prop이_있으면_외부_제어로_동작한다", () => {
    const onPageChange = vi.fn();
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.slice(0, 20)}
        isLoading={false}
        pagination={{
          currentPage: 1,
          totalPages: 2,
          totalItems: 25,
          pageSize: 20,
          onPageChange,
        }}
      />,
    );
    expect(screen.getByText(/총 25건 중 1-20/)).toBeDefined();
  });

  it("pagination_prop_다음_버튼_클릭시_외부_onPageChange_호출", async () => {
    const onPageChange = vi.fn();
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.slice(0, 20)}
        isLoading={false}
        pagination={{
          currentPage: 1,
          totalPages: 2,
          totalItems: 25,
          pageSize: 20,
          onPageChange,
        }}
      />,
    );
    await userEvent.click(screen.getByLabelText("다음 페이지"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("빈_데이터일_때_메시지를_표시한다", () => {
    render(<DeadlineTable title="테스트" deadlines={[]} isLoading={false} />);
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("hasUnfilteredData가_true이고_빈_배열이면_필터_빈_상태_메시지를_표시한다", () => {
    render(
      <DeadlineTable title="테스트" deadlines={[]} isLoading={false} hasUnfilteredData={true} />,
    );
    expect(screen.getByText("조건에 맞는 결과가 없습니다")).toBeDefined();
  });

  it("hasUnfilteredData가_false이고_빈_배열이면_데이터_없음_메시지를_표시한다", () => {
    render(
      <DeadlineTable title="테스트" deadlines={[]} isLoading={false} hasUnfilteredData={false} />,
    );
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("isError가_true이면_오류_메시지를_표시한다", () => {
    render(<DeadlineTable title="테스트" deadlines={undefined} isLoading={false} isError={true} />);
    expect(screen.getByText(/오류가 발생했습니다/)).toBeDefined();
  });

  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<DeadlineTable title="테스트" deadlines={undefined} isLoading={true} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });
});
