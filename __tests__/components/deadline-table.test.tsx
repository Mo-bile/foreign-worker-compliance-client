import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeadlineTable } from "@/components/compliance/deadline-table";
import type { ComplianceDeadlineResponse } from "@/types/api";

type DeadlineWithWorkerName = ComplianceDeadlineResponse & {
  readonly workerName?: string;
};

function createDeadline(overrides: Partial<DeadlineWithWorkerName> = {}): DeadlineWithWorkerName {
  return {
    id: overrides.id ?? 1,
    workerId: overrides.workerId ?? 1,
    workerName: overrides.workerName ?? `근로자 ${overrides.workerId ?? 1}`,
    deadlineType: overrides.deadlineType ?? "VISA_EXPIRY",
    dueDate: overrides.dueDate ?? "2026-01-15",
    status: overrides.status ?? "OVERDUE",
    description: overrides.description ?? `테스트 주요 기한 ${overrides.id ?? 1}`,
  };
}

const singleWorkerDeadlines: DeadlineWithWorkerName[] = Array.from({ length: 25 }, (_, index) =>
  createDeadline({
    id: index + 1,
    workerId: 1,
    workerName: "Worker-1",
    dueDate: `2026-${String((index % 12) + 1).padStart(2, "0")}-15`,
    description: `테스트 주요 기한 ${index + 1}`,
  }),
);

describe("DeadlineTable", () => {
  it("limit이_있으면_해당_건수만_표시하고_페이지네이션_미표시", () => {
    render(
      <DeadlineTable
        title="테스트"
        deadlines={singleWorkerDeadlines}
        isLoading={false}
        limit={5}
      />,
    );
    expect(screen.getAllByText(/테스트 주요 기한/)).toHaveLength(5);
    expect(screen.queryByLabelText("다음 페이지")).toBeNull();
  });

  it("limit_없으면_내부_페이지네이션이_동작한다", async () => {
    render(<DeadlineTable title="테스트" deadlines={singleWorkerDeadlines} isLoading={false} />);
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
        deadlines={singleWorkerDeadlines.slice(0, 20)}
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
        deadlines={singleWorkerDeadlines.slice(0, 20)}
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
    expect(screen.getByText("표시할 내용이 없습니다")).toBeDefined();
  });

  it("hasUnfilteredData가_true이고_빈_배열이면_필터_빈_상태_메시지를_표시한다", () => {
    render(
      <DeadlineTable title="테스트" deadlines={[]} isLoading={false} hasUnfilteredData={true} />,
    );
    expect(screen.getByText("조건에 맞는 결과가 없습니다")).toBeDefined();
  });

  it("hasUnfilteredData가_false이고_빈_배열이면_내용_없음_메시지를_표시한다", () => {
    render(
      <DeadlineTable title="테스트" deadlines={[]} isLoading={false} hasUnfilteredData={false} />,
    );
    expect(screen.getByText("표시할 내용이 없습니다")).toBeDefined();
  });

  it("isError가_true이면_오류_메시지를_표시한다", () => {
    render(<DeadlineTable title="테스트" deadlines={undefined} isLoading={false} isError={true} />);
    expect(screen.getByText(/내용을 불러오지 못했습니다/)).toBeDefined();
  });

  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<DeadlineTable title="테스트" deadlines={undefined} isLoading={true} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("onComplete이_있으면_처리_컬럼과_완료_버튼이_표시된다", () => {
    render(
      <DeadlineTable
        title="테스트"
        deadlines={singleWorkerDeadlines.slice(0, 3)}
        isLoading={false}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByText("처리")).toBeDefined();
    expect(screen.getAllByRole("button", { name: "완료" })).toHaveLength(3);
  });

  it("onComplete이_없으면_처리_컬럼이_표시되지_않는다", () => {
    render(
      <DeadlineTable
        title="테스트"
        deadlines={singleWorkerDeadlines.slice(0, 3)}
        isLoading={false}
      />,
    );

    expect(screen.queryByText("처리")).toBeNull();
    expect(screen.queryByRole("button", { name: "완료" })).toBeNull();
  });

  it("COMPLETED_상태인_항목은_완료_버튼이_비활성화된다", () => {
    const completedDeadline: DeadlineWithWorkerName[] = [
      createDeadline({
        id: 99,
        workerId: 1,
        workerName: "Worker-1",
        dueDate: "2026-01-01",
        status: "COMPLETED",
        description: "완료된 주요 기한",
      }),
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
        deadlines={singleWorkerDeadlines.slice(0, 1)}
        isLoading={false}
        onComplete={onComplete}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(onComplete).toHaveBeenCalledWith(singleWorkerDeadlines[0]);
  });

  describe("아코디언 그룹핑", () => {
    it("비OVERDUE_항목은_가장_빠른_dueDate_순으로_정렬한다", () => {
      const upcomingDeadlines: DeadlineWithWorkerName[] = [
        createDeadline({
          id: 1,
          workerId: 1,
          workerName: "Worker-Late",
          dueDate: "2026-06-01",
          status: "APPROACHING",
          description: "Late deadline 1",
        }),
        createDeadline({
          id: 2,
          workerId: 1,
          workerName: "Worker-Late",
          dueDate: "2026-07-01",
          status: "URGENT",
          description: "Late deadline 2",
        }),
        createDeadline({
          id: 3,
          workerId: 2,
          workerName: "Worker-Soon",
          dueDate: "2026-02-01",
          status: "APPROACHING",
          description: "Soon deadline",
        }),
      ];

      render(
        <DeadlineTable title="다가오는 주요 기한" deadlines={upcomingDeadlines} isLoading={false} />,
      );

      const soonHeader = screen.getByRole("button", { name: /Worker-Soon — 임박 1건/ });
      const lateHeader = screen.getByRole("button", { name: /Worker-Late — 임박 2건/ });

      expect(
        soonHeader.compareDocumentPosition(lateHeader) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("아코디언_내부_완료_버튼이_올바른_ID로_onComplete를_호출한다", async () => {
      const onComplete = vi.fn();
      const multiWorkerDeadlines: DeadlineWithWorkerName[] = [
        createDeadline({
          id: 10,
          workerId: 1,
          workerName: "Worker-A",
          dueDate: "2026-01-10",
          status: "OVERDUE",
          description: "Worker-A item 1",
        }),
        createDeadline({
          id: 20,
          workerId: 1,
          workerName: "Worker-A",
          dueDate: "2026-02-10",
          status: "OVERDUE",
          description: "Worker-A item 2",
        }),
        createDeadline({
          id: 30,
          workerId: 2,
          workerName: "Worker-B",
          dueDate: "2026-03-10",
          status: "OVERDUE",
          description: "Worker-B item 1",
        }),
      ];

      render(
        <DeadlineTable
          title="기한초과 항목"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
          onComplete={onComplete}
        />,
      );

      await userEvent.click(screen.getAllByRole("button", { name: "완료" })[0]);

      expect(onComplete).toHaveBeenCalledWith(multiWorkerDeadlines[0]);
    });

    it("펼쳐진_그룹을_클릭하면_접힌다", async () => {
      const multiWorkerDeadlines: DeadlineWithWorkerName[] = [
        createDeadline({
          id: 11,
          workerId: 1,
          workerName: "Worker-A",
          dueDate: "2026-01-10",
          status: "OVERDUE",
          description: "Worker-A item 1",
        }),
        createDeadline({
          id: 12,
          workerId: 1,
          workerName: "Worker-A",
          dueDate: "2026-01-20",
          status: "OVERDUE",
          description: "Worker-A item 2",
        }),
        createDeadline({
          id: 21,
          workerId: 2,
          workerName: "Worker-B",
          dueDate: "2026-03-10",
          status: "OVERDUE",
          description: "Worker-B item 1",
        }),
      ];

      render(
        <DeadlineTable
          title="기한초과 항목"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
        />,
      );

      expect(screen.getByText("Worker-A item 1")).toBeDefined();

      await userEvent.click(screen.getByRole("button", { name: /Worker-A — 기한초과 2건/ }));

      expect(screen.queryByText("Worker-A item 1")).toBeNull();
    });

    it("title에_기한초과가_없으면_임박_라벨을_표시한다", () => {
      const upcomingDeadlines: DeadlineWithWorkerName[] = [
        createDeadline({
          id: 1,
          workerId: 1,
          workerName: "Worker-A",
          dueDate: "2026-02-01",
          status: "APPROACHING",
          description: "Worker-A upcoming",
        }),
        createDeadline({
          id: 2,
          workerId: 2,
          workerName: "Worker-B",
          dueDate: "2026-02-05",
          status: "APPROACHING",
          description: "Worker-B upcoming",
        }),
      ];

      render(
        <DeadlineTable
          title="30일 안에 다가오는 주요 기한"
          deadlines={upcomingDeadlines}
          isLoading={false}
        />,
      );

      expect(screen.getByRole("button", { name: /Worker-A — 임박 1건/ })).toBeDefined();
    });

    it("variant_prop이_있으면_title_대신_variant로_라벨을_결정한다", () => {
      const overdueDeadlines: DeadlineWithWorkerName[] = [
        createDeadline({
          id: 1,
          workerId: 1,
          workerName: "Worker-A",
          dueDate: "2026-01-01",
          status: "OVERDUE",
          description: "Worker-A overdue",
        }),
        createDeadline({
          id: 2,
          workerId: 2,
          workerName: "Worker-B",
          dueDate: "2026-01-02",
          status: "OVERDUE",
          description: "Worker-B overdue",
        }),
      ];

      render(
        <DeadlineTable
          title="테스트 제목"
          deadlines={overdueDeadlines}
          isLoading={false}
          variant="overdue"
        />,
      );

      expect(screen.getByRole("button", { name: /Worker-A — 기한초과 1건/ })).toBeDefined();
    });

    it("근로자_그룹마다_상세보기_텍스트_링크를_표시한다", () => {
      const multiWorkerDeadlines: DeadlineWithWorkerName[] = [
        createDeadline({
          id: 1,
          workerId: 7,
          workerName: "Worker-A",
          dueDate: "2026-01-01",
          status: "OVERDUE",
          description: "Worker-A overdue",
        }),
        createDeadline({
          id: 2,
          workerId: 12,
          workerName: "Worker-B",
          dueDate: "2026-01-02",
          status: "OVERDUE",
          description: "Worker-B overdue",
        }),
      ];

      render(
        <DeadlineTable
          title="기한초과 항목"
          deadlines={multiWorkerDeadlines}
          isLoading={false}
          variant="overdue"
        />,
      );

      const detailLinks = screen.getAllByRole("link", { name: "상세 보기" });

      expect(detailLinks).toHaveLength(2);
      expect(detailLinks[0]).toHaveAttribute("href", "/workers/7");
      expect(detailLinks[1]).toHaveAttribute("href", "/workers/12");
    });
  });
});
