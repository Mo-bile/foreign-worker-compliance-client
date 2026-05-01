import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AiAnalysisProgress } from "@/components/common/ai-analysis-progress";

describe("AiAnalysisProgress", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("variant별 첫 문구", () => {
    it("dashboard는_근로자_현황으로_시작한다", () => {
      render(<AiAnalysisProgress variant="dashboard" isPending={true} />);
      expect(screen.getByText("근로자 현황을 조회하고 있습니다...")).toBeDefined();
    });

    it("benchmark는_임금_정보로_시작한다", () => {
      render(<AiAnalysisProgress variant="benchmark" isPending={true} />);
      expect(screen.getByText("사업장 임금 정보를 확인하고 있습니다...")).toBeDefined();
    });

    it("simulation는_고용_한도로_시작한다", () => {
      render(<AiAnalysisProgress variant="simulation" isPending={true} />);
      expect(screen.getByText("고용 한도를 계산하고 있습니다...")).toBeDefined();
    });
  });

  describe("부제 표시", () => {
    it("첫_문구의_부제가_렌더링된다", () => {
      render(<AiAnalysisProgress variant="dashboard" isPending={true} />);
      expect(screen.getByText("비자 유형별 분포 확인")).toBeDefined();
    });
  });

  describe("단계 전환", () => {
    it("시간_경과에_따라_라벨이_변경된다", () => {
      vi.useFakeTimers();
      render(<AiAnalysisProgress variant="dashboard" isPending={true} />);

      expect(screen.getByText("1 / 12 단계")).toBeDefined();

      // dashboard front duration per step = 25000 * 0.2 / 4 = 1250ms
      // After 1250ms elapsed, step should become 2 / 12.
      act(() => {
        vi.advanceTimersByTime(1300);
      });
      expect(screen.getByText("2 / 12 단계")).toBeDefined();
      act(() => {
        vi.advanceTimersByTime(160);
      });
      expect(screen.getByText("4대보험 의무 적용률 계산")).toBeDefined();
    });
  });

  describe("isPending 상태", () => {
    it("isPending이_false이고_이전_진행_없으면_null을_반환한다", () => {
      const { container } = render(<AiAnalysisProgress variant="dashboard" isPending={false} />);
      expect(container.innerHTML).toBe("");
    });

    it("isPending이_false로_바뀌면_완료_표시_후_사라진다", () => {
      vi.useFakeTimers();
      const { rerender } = render(<AiAnalysisProgress variant="dashboard" isPending={true} />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      rerender(<AiAnalysisProgress variant="dashboard" isPending={false} />);
      expect(screen.getByText("분석 완료!")).toBeDefined();

      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.queryByText("분석 완료!")).toBeNull();
    });
  });

  describe("메타 정보", () => {
    it("경과시간을_표시한다", () => {
      vi.useFakeTimers();
      render(<AiAnalysisProgress variant="dashboard" isPending={true} />);
      expect(screen.getByText("0초 경과")).toBeDefined();

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByText("3초 경과")).toBeDefined();
    });

    it("단계_카운트를_표시한다", () => {
      render(<AiAnalysisProgress variant="dashboard" isPending={true} />);
      expect(screen.getByText("1 / 12 단계")).toBeDefined();
    });
  });
});
