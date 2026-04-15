import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DashboardInsightProgress } from "@/components/dashboard/dashboard-insight-progress";

describe("DashboardInsightProgress", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("isPending이_true면_프로그레스를_렌더링한다", () => {
    render(<DashboardInsightProgress isPending={true} />);
    expect(screen.getByText("사업장 데이터 수집 중...")).toBeDefined();
    expect(screen.getByText("1 / 3 단계")).toBeDefined();
  });

  it("isPending이_false이고_이전_진행_없으면_null을_반환한다", () => {
    const { container } = render(<DashboardInsightProgress isPending={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("시간_경과에_따라_단계가_전환된다", () => {
    vi.useFakeTimers();
    render(<DashboardInsightProgress isPending={true} />);

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText("AI 분석 중...")).toBeDefined();
    expect(screen.getByText("2 / 3 단계")).toBeDefined();
  });

  it("isPending이_false로_바뀌면_완료_표시_후_사라진다", () => {
    vi.useFakeTimers();
    const { rerender } = render(<DashboardInsightProgress isPending={true} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender(<DashboardInsightProgress isPending={false} />);
    expect(screen.getByText("분석 완료!")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByText("분석 완료!")).toBeNull();
  });
});
