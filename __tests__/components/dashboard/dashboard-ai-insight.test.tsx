import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardAiInsight } from "@/components/dashboard/dashboard-ai-insight";
import type { AiInsight } from "@/types/dashboard";

vi.mock("@/lib/utils/format-relative-time", () => ({
  formatRelativeTime: () => "3시간 전",
}));

describe("DashboardAiInsight", () => {
  const mockOnGenerate = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("빈 상태 (aiInsight === null)", () => {
    it("다크_모드_패널_스타일을_포함한다", () => {
      const { container } = render(
        <DashboardAiInsight aiInsight={null} isPending={false} onGenerate={mockOnGenerate} />,
      );
      const panel = container.firstElementChild as HTMLElement;

      expect(panel.className).toContain("dark:border-border");
      expect(panel.className).toContain("dark:from-card");
      expect(panel.className).toContain("dark:to-[oklch(0.16_0.03_260)]");
    });

    it("안내_문구와_AI_분석_버튼을_렌더링한다", () => {
      render(<DashboardAiInsight aiInsight={null} isPending={false} onGenerate={mockOnGenerate} />);
      expect(screen.getByText("아직 AI 분석 결과가 없습니다.")).toBeDefined();
      expect(screen.getByRole("button", { name: /AI 분석/ })).toBeDefined();
    });

    it("AI_분석_버튼_클릭_시_onGenerate를_호출한다", () => {
      render(<DashboardAiInsight aiInsight={null} isPending={false} onGenerate={mockOnGenerate} />);
      fireEvent.click(screen.getByRole("button", { name: /AI 분석/ }));
      expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe("결과 상태 (aiInsight !== null)", () => {
    const mockInsight: AiInsight = {
      content: "**테스트** 인사이트 내용",
      generatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10분 전 (쿨다운 해제)
    };

    it("마크다운_콘텐츠를_렌더링한다", () => {
      render(
        <DashboardAiInsight
          aiInsight={mockInsight}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText("테스트")).toBeDefined();
      expect(screen.getByText(/인사이트 내용/)).toBeDefined();
    });

    it("상대시간을_표시한다", () => {
      render(
        <DashboardAiInsight
          aiInsight={mockInsight}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText(/3시간 전 분석됨/)).toBeDefined();
    });

    it("다시_분석_버튼을_렌더링한다", () => {
      render(
        <DashboardAiInsight
          aiInsight={mockInsight}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByRole("button", { name: /다시 분석/ })).toBeDefined();
    });

    it("다시_분석_버튼_클릭_시_onGenerate를_호출한다", () => {
      render(
        <DashboardAiInsight
          aiInsight={mockInsight}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /다시 분석/ }));
      expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe("로딩 상태 (isPending === true)", () => {
    it("프로그레스_컴포넌트를_렌더링한다", () => {
      render(<DashboardAiInsight aiInsight={null} isPending={true} onGenerate={mockOnGenerate} />);
      expect(screen.getByText("근로자 현황을 조회하고 있습니다...")).toBeDefined();
    });

    it("버튼을_렌더링하지_않는다", () => {
      render(<DashboardAiInsight aiInsight={null} isPending={true} onGenerate={mockOnGenerate} />);
      expect(screen.queryByRole("button", { name: /AI 분석/ })).toBeNull();
      expect(screen.queryByRole("button", { name: /다시 분석/ })).toBeNull();
    });
  });

  describe("쿨다운 (5분)", () => {
    it("생성_후_5분_이내면_다시_분석_버튼이_비활성화된다", () => {
      const recentInsight: AiInsight = {
        content: "테스트",
        generatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
      };
      render(
        <DashboardAiInsight
          aiInsight={recentInsight}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      const button = screen.getByRole("button", { name: /다시 분석/ });
      expect(button).toHaveProperty("disabled", true);
    });

    it("쿨다운_중_남은_시간을_표시한다", () => {
      const recentInsight: AiInsight = {
        content: "테스트",
        generatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
      };
      render(
        <DashboardAiInsight
          aiInsight={recentInsight}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText(/분 후 다시 분석할 수 있습니다/)).toBeDefined();
    });

    it("5분_경과_후에는_다시_분석_버튼이_활성화된다", () => {
      const oldInsight: AiInsight = {
        content: "테스트",
        generatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6분 전
      };
      render(
        <DashboardAiInsight aiInsight={oldInsight} isPending={false} onGenerate={mockOnGenerate} />,
      );
      const button = screen.getByRole("button", { name: /다시 분석/ });
      expect(button).toHaveProperty("disabled", false);
    });
  });

  describe("면책조항", () => {
    it("모든_상태에서_면책조항을_표시한다", () => {
      const { rerender } = render(
        <DashboardAiInsight aiInsight={null} isPending={false} onGenerate={mockOnGenerate} />,
      );
      expect(screen.getByText(/법률 자문이 아닌 관리 보조 도구/)).toBeDefined();

      rerender(
        <DashboardAiInsight
          aiInsight={{ content: "test", generatedAt: "2026-04-15T10:00:00Z" }}
          isPending={false}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText(/법률 자문이 아닌 관리 보조 도구/)).toBeDefined();
    });
  });
});
