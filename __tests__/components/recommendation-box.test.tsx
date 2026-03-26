import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationBox } from "@/components/simulator/recommendation-box";
import type { RecommendationItem } from "@/types/simulator";

const items: RecommendationItem[] = [
  { text: "내국인 구인노력 의무기간 14일을 우선 이행하세요", linkText: "워크넷 바로가기", href: "https://www.work.go.kr" },
  { text: "E-9 비자 발급까지 평균 3~5개월이 소요됩니다" },
];

describe("RecommendationBox", () => {
  it("제목을_렌더링한다", () => {
    render(<RecommendationBox recommendations={items} />);
    expect(screen.getByText("다음 단계 추천")).toBeDefined();
  });

  it("추천_항목_텍스트를_렌더링한다", () => {
    render(<RecommendationBox recommendations={items} />);
    expect(screen.getByText(/내국인 구인노력/)).toBeDefined();
    expect(screen.getByText(/3~5개월/)).toBeDefined();
  });

  it("링크가_있는_항목은_a태그로_렌더링한다", () => {
    render(<RecommendationBox recommendations={items} />);
    const link = screen.getByText("워크넷 바로가기");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("https://www.work.go.kr");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("링크가_없는_항목은_텍스트만_표시한다", () => {
    render(<RecommendationBox recommendations={items} />);
    expect(screen.getByText(/3~5개월/)).toBeDefined();
    // Should not have a link
    const textElement = screen.getByText(/3~5개월/);
    expect(textElement.querySelector("a")).toBeNull();
  });
});
