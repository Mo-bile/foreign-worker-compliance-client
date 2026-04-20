import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import type { ComplianceDeadlineResponse } from "@/types/api";

const testDeadlines: ComplianceDeadlineResponse[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  workerId: (i % 5) + 1,
  workerName: `Worker-${(i % 5) + 1}`,
  deadlineType: "VISA_EXPIRY" as const,
  dueDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
  status: "OVERDUE" as const,
  description: `테스트 데드라인 ${i + 1}`,
}));

const multiWorkerDeadlines: ComplianceDeadlineResponse[] = [
  {
    id: 1,
    workerId: 1,
    workerName: "Worker-A",
    deadlineType: "VISA_EXPIRY",
    dueDate: "2025-01-01",
    status: "OVERDUE",
    description: "비자 갱신 A",
  },
  {
    id: 2,
    workerId: 1,
    workerName: "Worker-A",
    deadlineType: "NATIONAL_PENSION_ENROLLMENT",
    dueDate: "2025-01-01",
    status: "OVERDUE",
    description: "국민연금 취득신고 A",
  },
  {
    id: 3,
    workerId: 1,
    workerName: "Worker-A",
    deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
    dueDate: "2025-01-01",
    status: "OVERDUE",
    description: "건강보험 취득신고 A",
  },
  {
    id: 4,
    workerId: 2,
    workerName: "Worker-B",
    deadlineType: "VISA_EXPIRY",
    dueDate: "2025-02-01",
    status: "OVERDUE",
    description: "비자 갱신 B",
  },
];

function getAccordionHeaders() {
  return screen
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("aria-expanded"));
}

describe("DeadlineTable", () => {
  it("limit이_있으면_해당_건수만_표시하고_페이지네이션_미표시", () => {
    render(<DeadlineTable title="테스트" deadlines={testDeadlines} isLoading={false} limit={5} />);
    expect(getAccordionHeaders()).toHaveLength(5);
    expect(screen.getByRole("button", { name: /Worker-1/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Worker-5/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("다음 페이지")).toBeNull();
  });

  it("limit_없으면_내부_페이지네이션이_동작한다", async () => {
    render(<DeadlineTable title="테스트" deadlines={testDeadlines} isLoading={false} />);
    expect(screen.getByText(/총 25건 중 1-20/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Worker-1/ })).toBeInTheDocument();
    expect(screen.getByLabelText("다음 페이지")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("다음 페이지"));
    expect(screen.getByText(/총 25건 중 21-25/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Worker-1/ })).toBeInTheDocument();
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

  it("onComplete이_있으면_처리_컬럼과_완료_버튼이_표시된다", () => {
    const onComplete = vi.fn();
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.filter((d) => d.workerId === 1).slice(0, 3)}
        isLoading={false}
        onComplete={onComplete}
      />,
    );
    expect(screen.getByText("처리")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "완료" })).toHaveLength(3);
  });

  it("onComplete이_없으면_처리_컬럼이_표시되지_않는다", () => {
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.filter((d) => d.workerId === 1).slice(0, 3)}
        isLoading={false}
      />,
    );
    expect(screen.queryByText("처리")).toBeNull();
    expect(screen.queryByRole("button", { name: "완료" })).toBeNull();
  });

  it("COMPLETED_상태인_항목은_완료_버튼이_비활성화된다", () => {
    const completedDeadline: ComplianceDeadlineResponse[] = [
      {
        id: 99,
        workerId: 1,
        workerName: "Worker-1",
        deadlineType: "VISA_EXPIRY",
        dueDate: "2026-01-01",
        status: "COMPLETED",
        description: "완료된 데드라인",
      },
    ];
    render(
      <DeadlineTable
        title="테스트"
        deadlines={completedDeadline}
        isLoading={false}
        onComplete={vi.fn()}
      />,
    );
    const button = screen.getByRole("button", { name: "완료됨" });
    expect(button).toHaveProperty("disabled", true);
  });

  it("완료_버튼_클릭시_onComplete_콜백이_호출된다", async () => {
    const onComplete = vi.fn();
    render(
      <DeadlineTable
        title="테스트"
        deadlines={testDeadlines.slice(0, 1)}
        isLoading={false}
        onComplete={onComplete}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "완료" }));
    expect(onComplete).toHaveBeenCalledWith(testDeadlines[0].id);
  });

  describe("아코디언 그룹핑", () => {
    it("근로자별로_그룹핑하여_아코디언_헤더를_표시한다", () => {
      render(
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
        />,
      );

      const workerAHeader = screen.getByRole("button", { name: /Worker-A/ });
      const workerBHeader = screen.getByRole("button", { name: /Worker-B/ });

      expect(workerAHeader).toHaveTextContent("Worker-A");
      expect(workerAHeader).toHaveTextContent("기한초과");
      expect(workerAHeader).toHaveTextContent("3건");
      expect(workerBHeader).toHaveTextContent("Worker-B");
      expect(workerBHeader).toHaveTextContent("기한초과");
      expect(workerBHeader).toHaveTextContent("1건");
    });

    it("첫_번째_그룹이_기본_펼침_상태이다", () => {
      render(
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
        />,
      );

      const workerAHeader = screen.getByRole("button", { name: /Worker-A/ });

      expect(workerAHeader).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("비자 갱신 A")).toBeInTheDocument();
      expect(screen.getByText("국민연금 취득신고 A")).toBeInTheDocument();
      expect(screen.getByText("건강보험 취득신고 A")).toBeInTheDocument();
    });

    it("접힌_그룹의_데드라인은_보이지_않는다", () => {
      render(
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
        />,
      );

      const workerBHeader = screen.getByRole("button", { name: /Worker-B/ });

      expect(workerBHeader).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText("비자 갱신 B")).not.toBeInTheDocument();
    });

    it("아코디언_헤더_클릭으로_펼침_토글한다", async () => {
      render(
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
        />,
      );

      const workerBHeader = screen.getByRole("button", { name: /Worker-B/ });

      await userEvent.click(workerBHeader);

      expect(workerBHeader).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("비자 갱신 B")).toBeInTheDocument();
    });

    it("단일_근로자면_아코디언_없이_flat_테이블로_표시한다", () => {
      render(
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={multiWorkerDeadlines.filter((deadline) => deadline.workerId === 1)}
          isLoading={false}
        />,
      );

      expect(screen.queryByRole("button", { name: /Worker-A/ })).not.toBeInTheDocument();
      expect(screen.getByText("비자 갱신 A")).toBeInTheDocument();
      expect(screen.getByText("국민연금 취득신고 A")).toBeInTheDocument();
      expect(screen.getByText("건강보험 취득신고 A")).toBeInTheDocument();
    });

    it("초과_건수_많은_순으로_정렬한다", () => {
      render(
        <DeadlineTable
          title="기한초과 데드라인"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
        />,
      );

      const accordionHeaders = getAccordionHeaders();

      expect(accordionHeaders[0]).toHaveTextContent("Worker-A");
    });
  });
});
