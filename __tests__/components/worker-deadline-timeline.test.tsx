import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkerDeadlineTimeline } from "@/components/workers/worker-deadline-timeline";
import type { ComplianceDeadlineResponse } from "@/types/api";

function createDeadline(
  overrides: Partial<ComplianceDeadlineResponse> = {},
): ComplianceDeadlineResponse {
  return {
    id: overrides.id ?? 1,
    workerId: overrides.workerId ?? 1,
    workerName: overrides.workerName ?? "테스트 근로자",
    deadlineType: overrides.deadlineType ?? "VISA_EXPIRY",
    dueDate: overrides.dueDate ?? "2026-04-01",
    status: overrides.status ?? "PENDING",
    description: overrides.description ?? "테스트 데드라인",
  };
}

describe("WorkerDeadlineTimeline", () => {
  it("데드라인 항목의 description을 표시한다", () => {
    const deadlines = [createDeadline({ description: "비자 만료일 갱신" })];
    render(<WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />);
    expect(screen.getByText("비자 만료일 갱신")).toBeInTheDocument();
  });

  it("상태별 한글 뱃지 텍스트를 표시한다", () => {
    const deadlines = [
      createDeadline({ id: 1, status: "OVERDUE", description: "d1" }),
      createDeadline({ id: 2, status: "URGENT", description: "d2" }),
      createDeadline({ id: 3, status: "APPROACHING", description: "d3" }),
      createDeadline({ id: 4, status: "PENDING", description: "d4" }),
      createDeadline({ id: 5, status: "COMPLETED", description: "d5" }),
    ];
    render(<WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />);
    expect(screen.getByText("기한초과")).toBeInTheDocument();
    expect(screen.getByText("긴급")).toBeInTheDocument();
    expect(screen.getByText("임박")).toBeInTheDocument();
    expect(screen.getByText("대기")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
  });

  it("enum 코드(VISA_EXPIRY 등)를 UI에 노출하지 않는다", () => {
    const deadlines = [
      createDeadline({ deadlineType: "VISA_EXPIRY", description: "비자 만료" }),
      createDeadline({
        id: 2,
        deadlineType: "NATIONAL_PENSION_ENROLLMENT",
        description: "국민연금",
      }),
    ];
    const { container } = render(
      <WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />,
    );
    expect(container.textContent).not.toContain("VISA_EXPIRY");
    expect(container.textContent).not.toContain("NATIONAL_PENSION_ENROLLMENT");
  });

  it("OVERDUE → URGENT → APPROACHING → PENDING → COMPLETED 순으로 정렬한다", () => {
    const deadlines = [
      createDeadline({ id: 1, status: "COMPLETED", description: "완료 항목" }),
      createDeadline({ id: 2, status: "OVERDUE", description: "초과 항목" }),
      createDeadline({ id: 3, status: "APPROACHING", description: "임박 항목" }),
      createDeadline({ id: 4, status: "URGENT", description: "긴급 항목" }),
      createDeadline({ id: 5, status: "PENDING", description: "대기 항목" }),
    ];
    render(<WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />);

    const items = screen.getAllByTestId("timeline-item");
    expect(items[0]).toHaveTextContent("초과 항목");
    expect(items[1]).toHaveTextContent("긴급 항목");
    expect(items[2]).toHaveTextContent("임박 항목");
    expect(items[3]).toHaveTextContent("대기 항목");
    expect(items[4]).toHaveTextContent("완료 항목");
  });

  it("같은 상태 내에서 dueDate 오름차순으로 정렬한다", () => {
    const deadlines = [
      createDeadline({
        id: 1,
        status: "OVERDUE",
        dueDate: "2026-03-15",
        description: "늦은 초과",
      }),
      createDeadline({
        id: 2,
        status: "OVERDUE",
        dueDate: "2026-03-01",
        description: "빠른 초과",
      }),
    ];
    render(<WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />);

    const items = screen.getAllByTestId("timeline-item");
    expect(items[0]).toHaveTextContent("빠른 초과");
    expect(items[1]).toHaveTextContent("늦은 초과");
  });

  it("COMPLETED 항목에 dimmed 스타일(opacity)이 적용된다", () => {
    const deadlines = [createDeadline({ status: "COMPLETED", description: "완료됨" })];
    render(<WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />);

    const item = screen.getByTestId("timeline-item");
    expect(item.className).toMatch(/opacity/);
  });

  it("데드라인이 없으면 빈 상태 메시지를 표시한다", () => {
    render(<WorkerDeadlineTimeline deadlines={[]} isLoading={false} />);
    expect(screen.getByText("등록된 데드라인이 없습니다")).toBeInTheDocument();
  });

  it("로딩 중이면 스켈레톤을 표시한다", () => {
    const { container } = render(<WorkerDeadlineTimeline deadlines={undefined} isLoading={true} />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("에러 상태이면 에러 메시지를 표시한다", () => {
    render(<WorkerDeadlineTimeline deadlines={undefined} isLoading={false} isError={true} />);
    expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
  });

  it("날짜를 YYYY-MM-DD 형식으로 표시한다", () => {
    const deadlines = [createDeadline({ dueDate: "2026-05-15" })];
    render(<WorkerDeadlineTimeline deadlines={deadlines} isLoading={false} />);
    expect(screen.getByText("2026-05-15")).toBeInTheDocument();
  });
});
