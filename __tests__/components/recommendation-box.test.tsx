import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationBox } from "@/components/simulator/recommendation-box";
import type { RecommendationDisplayData } from "@/types/simulator";

const greenData: RecommendationDisplayData = {
  variant: "green",
  title: "채용 진행 권장",
  items: [
    { text: "현재 한도 내에서 채용 가능합니다." },
    { text: "고용노동부 안내", linkText: "바로가기", href: "https://www.moel.go.kr" },
  ],
};

const yellowData: RecommendationDisplayData = {
  variant: "yellow",
  title: "개선 후 재검토 필요",
  items: [
    { text: "내국인 고용보험 가입자를 늘려야 합니다." },
    { text: "점수 개선 방법", linkText: "자세히 보기", href: "https://example.com/improve" },
  ],
};

describe("RecommendationBox", () => {
  describe("green 변형", () => {
    it("title을 렌더링한다", () => {
      render(<RecommendationBox data={greenData} />);
      expect(screen.getByText("채용 진행 권장")).toBeDefined();
    });

    it("컨테이너에 green 배경 클래스가 적용된다", () => {
      const { container } = render(<RecommendationBox data={greenData} />);
      const box = container.firstChild as HTMLElement;
      expect(box.className).toContain("bg-signal-green-bg");
    });

    it("title에 green 텍스트 색상 클래스가 적용된다", () => {
      render(<RecommendationBox data={greenData} />);
      const title = screen.getByText("채용 진행 권장");
      const titleContainer = title.closest("div");
      expect(titleContainer?.className).toContain("text-signal-green");
    });
  });

  describe("yellow 변형", () => {
    it("title을 렌더링한다", () => {
      render(<RecommendationBox data={yellowData} />);
      expect(screen.getByText("개선 후 재검토 필요")).toBeDefined();
    });

    it("컨테이너에 yellow 배경 클래스가 적용된다", () => {
      const { container } = render(<RecommendationBox data={yellowData} />);
      const box = container.firstChild as HTMLElement;
      expect(box.className).toContain("bg-signal-yellow-bg");
    });

    it("title에 orange 텍스트 색상 클래스가 적용된다", () => {
      render(<RecommendationBox data={yellowData} />);
      const title = screen.getByText("개선 후 재검토 필요");
      const titleContainer = title.closest("div");
      expect(titleContainer?.className).toContain("text-signal-orange");
    });
  });

  describe("items 렌더링", () => {
    it("link 없는 일반 텍스트 항목을 렌더링한다", () => {
      render(<RecommendationBox data={greenData} />);
      expect(screen.getByText("현재 한도 내에서 채용 가능합니다.")).toBeDefined();
    });

    it("링크가 있는 항목의 linkText를 렌더링한다", () => {
      render(<RecommendationBox data={greenData} />);
      expect(screen.getByText("바로가기")).toBeDefined();
    });

    it("href가 있는 항목은 <a> 태그로 렌더링된다", () => {
      render(<RecommendationBox data={greenData} />);
      const link = screen.getByText("바로가기").closest("a");
      expect(link).toBeDefined();
      expect(link?.getAttribute("href")).toBe("https://www.moel.go.kr");
    });

    it("링크에 target='_blank' 속성이 있다", () => {
      render(<RecommendationBox data={greenData} />);
      const link = screen.getByText("바로가기").closest("a");
      expect(link?.getAttribute("target")).toBe("_blank");
    });

    it("링크에 rel='noopener noreferrer' 속성이 있다", () => {
      render(<RecommendationBox data={greenData} />);
      const link = screen.getByText("바로가기").closest("a");
      expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("yellow 변형에서도 링크가 올바르게 렌더링된다", () => {
      render(<RecommendationBox data={yellowData} />);
      const link = screen.getByText("자세히 보기").closest("a");
      expect(link?.getAttribute("href")).toBe("https://example.com/improve");
      expect(link?.getAttribute("target")).toBe("_blank");
    });

    it("여러 항목이 모두 렌더링된다", () => {
      render(<RecommendationBox data={yellowData} />);
      expect(screen.getByText("내국인 고용보험 가입자를 늘려야 합니다.")).toBeDefined();
      expect(screen.getByText("자세히 보기")).toBeDefined();
    });
  });
});
