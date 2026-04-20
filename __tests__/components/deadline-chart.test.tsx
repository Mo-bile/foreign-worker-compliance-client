import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DeadlineChart,
  groupDeadlinesByDateAndStatus,
} from "@/components/dashboard/deadline-chart";
import type { ComplianceDeadlineResponse } from "@/types/api";

function makeDeadline(
  overrides: Partial<ComplianceDeadlineResponse> = {},
): ComplianceDeadlineResponse {
  return {
    id: 1,
    workerId: 1,
    workerName: "Worker-1",
    deadlineType: "VISA_EXPIRY",
    dueDate: "2026-04-01",
    status: "PENDING",
    description: "테스트",
    ...overrides,
  };
}

describe("DeadlineChart", () => {
  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<DeadlineChart deadlines={undefined} isLoading={true} isError={false} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("에러_상태에서_오류_메시지를_표시한다", () => {
    render(<DeadlineChart deadlines={undefined} isLoading={false} isError />);
    expect(screen.getByText(/오류가 발생했습니다/)).toBeDefined();
  });

  it("빈_배열일_때_빈_상태_메시지를_표시한다", () => {
    render(<DeadlineChart deadlines={[]} isLoading={false} isError={false} />);
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("OVERDUE와_COMPLETED만_있으면_빈_상태를_표시한다", () => {
    const deadlines = [
      makeDeadline({ id: 1, status: "OVERDUE" }),
      makeDeadline({ id: 2, status: "COMPLETED" }),
    ];
    render(<DeadlineChart deadlines={deadlines} isLoading={false} isError={false} />);
    expect(screen.getByText("데이터가 없습니다")).toBeDefined();
  });

  it("범례에_상태_라벨이_표시된다", () => {
    const deadlines = [
      makeDeadline({ id: 1, status: "URGENT", dueDate: "2026-04-01" }),
      makeDeadline({ id: 2, status: "APPROACHING", dueDate: "2026-04-01" }),
      makeDeadline({ id: 3, status: "PENDING", dueDate: "2026-04-02" }),
    ];
    render(<DeadlineChart deadlines={deadlines} isLoading={false} isError={false} />);
    expect(screen.getByText("긴급")).toBeDefined();
    expect(screen.getByText("임박")).toBeDefined();
    expect(screen.getByText("대기")).toBeDefined();
  });

  it("단일_날짜_단일_상태에서_정상_렌더한다", () => {
    const deadlines = [makeDeadline({ id: 1, status: "PENDING", dueDate: "2026-04-01" })];
    render(<DeadlineChart deadlines={deadlines} isLoading={false} isError={false} />);
    expect(screen.queryByText("데이터가 없습니다")).toBeNull();
  });

  describe("groupDeadlinesByDateAndStatus", () => {
    it("같은_날짜의_데드라인을_상태별로_집계한다", () => {
      const deadlines = [
        makeDeadline({ id: 1, status: "URGENT", dueDate: "2026-04-01" }),
        makeDeadline({ id: 2, status: "URGENT", dueDate: "2026-04-01" }),
        makeDeadline({ id: 3, status: "APPROACHING", dueDate: "2026-04-01" }),
        makeDeadline({ id: 4, status: "PENDING", dueDate: "2026-04-02" }),
      ];
      const result = groupDeadlinesByDateAndStatus(deadlines);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ urgent: 2, approaching: 1, pending: 0 });
      expect(result[1]).toMatchObject({ urgent: 0, approaching: 0, pending: 1 });
    });

    it("OVERDUE와_COMPLETED를_제외한다", () => {
      const deadlines = [
        makeDeadline({ id: 1, status: "OVERDUE", dueDate: "2026-04-01" }),
        makeDeadline({ id: 2, status: "COMPLETED", dueDate: "2026-04-01" }),
        makeDeadline({ id: 3, status: "PENDING", dueDate: "2026-04-01" }),
      ];
      const result = groupDeadlinesByDateAndStatus(deadlines);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ urgent: 0, approaching: 0, pending: 1 });
    });

    it("날짜순으로_정렬한다", () => {
      const deadlines = [
        makeDeadline({ id: 1, status: "PENDING", dueDate: "2026-04-10" }),
        makeDeadline({ id: 2, status: "PENDING", dueDate: "2026-04-01" }),
      ];
      const result = groupDeadlinesByDateAndStatus(deadlines);
      expect(result[0]?.sortKey).toBe("2026-04-01");
      expect(result[1]?.sortKey).toBe("2026-04-10");
    });

    it("잘못된_날짜_형식의_데드라인을_건너뛴다", () => {
      const deadlines = [
        makeDeadline({ id: 1, status: "PENDING", dueDate: "" }),
        makeDeadline({ id: 2, status: "PENDING", dueDate: "20260401" }),
        makeDeadline({ id: 3, status: "PENDING", dueDate: "2026-04-01" }),
      ];
      const result = groupDeadlinesByDateAndStatus(deadlines);
      expect(result).toHaveLength(1);
      expect(result[0]?.date).not.toContain("NaN");
    });

    it("date_필드를_M/D_형식으로_포맷한다", () => {
      const result = groupDeadlinesByDateAndStatus([makeDeadline({ dueDate: "2026-04-01" })]);
      expect(result[0]?.date).toBe("4/1");
    });
  });
});
