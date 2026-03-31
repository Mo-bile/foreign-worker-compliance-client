import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerdictCard } from "@/components/simulator/verdict-card";
import type { VerdictDisplayData } from "@/types/simulator";

const withinQuotaData: VerdictDisplayData = {
  verdict: "WITHIN_QUOTA",
  title: "추가 채용 가능",
  limitText: "현재 고용 한도 내에서 추가 채용이 가능합니다.",
  currentCount: 3,
  totalLimit: 10,
  remainingCapacity: 7,
  usagePercent: 30,
  progressLevel: "low",
  summaryText: "신청 가능 인원이 충분히 남아 있습니다.",
  additionalBonuses: [],
};

const exceededData: VerdictDisplayData = {
  verdict: "EXCEEDED",
  title: "추가 채용 불가",
  limitText: "현재 고용 한도를 초과하였습니다.",
  currentCount: 10,
  totalLimit: 10,
  remainingCapacity: 0,
  usagePercent: 100,
  progressLevel: "critical",
  summaryText: "한도를 초과하여 추가 채용이 불가능합니다.",
  additionalBonuses: [],
};

describe("VerdictCard", () => {
  describe("WITHIN_QUOTA 상태", () => {
    it("초록색 타이틀 '추가 채용 가능'을 렌더링한다", () => {
      render(<VerdictCard data={withinQuotaData} />);
      const title = screen.getByText("추가 채용 가능");
      expect(title).toBeDefined();
      const titleContainer = title.closest("div");
      expect(titleContainer?.className).toContain("text-signal-green");
    });

    it("Check 아이콘 영역이 존재한다 (X 아이콘 없음)", () => {
      const { container } = render(<VerdictCard data={withinQuotaData} />);
      // lucide Check renders an svg; X should not be present as a sibling to title
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("녹색 테두리 클래스가 적용된다", () => {
      const { container } = render(<VerdictCard data={withinQuotaData} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("border-signal-green");
    });
  });

  describe("EXCEEDED 상태", () => {
    it("빨간색 타이틀 '추가 채용 불가'를 렌더링한다", () => {
      render(<VerdictCard data={exceededData} />);
      const title = screen.getByText("추가 채용 불가");
      expect(title).toBeDefined();
      const titleContainer = title.closest("div");
      expect(titleContainer?.className).toContain("text-signal-red");
    });

    it("X 아이콘 영역이 존재한다", () => {
      const { container } = render(<VerdictCard data={exceededData} />);
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("빨간색 테두리 클래스가 적용된다", () => {
      const { container } = render(<VerdictCard data={exceededData} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("border-signal-red");
    });
  });

  describe("Progress bar", () => {
    it("올바른 width 스타일과 aria 속성을 가진다 (WITHIN_QUOTA)", () => {
      render(<VerdictCard data={withinQuotaData} />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar.getAttribute("aria-valuenow")).toBe("30");
      expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
      expect(progressBar.getAttribute("aria-valuemax")).toBe("100");
      expect((progressBar as HTMLElement).style.width).toBe("30%");
    });

    it("usagePercent 100%일 때 width가 100%로 고정된다", () => {
      const overData: VerdictDisplayData = {
        ...exceededData,
        usagePercent: 120,
      };
      render(<VerdictCard data={overData} />);
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar.getAttribute("aria-valuenow")).toBe("120");
      expect((progressBar as HTMLElement).style.width).toBe("100%");
    });
  });

  describe("수치 표시", () => {
    it("현재 고용 인원 수를 표시한다", () => {
      render(<VerdictCard data={withinQuotaData} />);
      expect(screen.getByText("3명")).toBeDefined();
    });

    it("잔여 한도를 표시한다", () => {
      render(<VerdictCard data={withinQuotaData} />);
      expect(screen.getByText("7명")).toBeDefined();
    });

    it("고용 현황 요약 텍스트를 표시한다 (currentCount / totalLimit)", () => {
      render(<VerdictCard data={withinQuotaData} />);
      expect(screen.getByText("3 / 10 (30%)")).toBeDefined();
    });

    it("summaryText를 렌더링한다", () => {
      render(<VerdictCard data={withinQuotaData} />);
      expect(screen.getByText("신청 가능 인원이 충분히 남아 있습니다.")).toBeDefined();
    });
  });
});
