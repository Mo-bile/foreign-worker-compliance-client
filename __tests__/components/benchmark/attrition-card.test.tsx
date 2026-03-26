import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttritionCard } from "@/components/benchmark/attrition-card";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";

describe("AttritionCard", () => {
  it("타이틀을_렌더링한다", () => {
    render(<AttritionCard data={mockBenchmarkResponse.attrition} defaultInsightOpen={false} />);
    expect(screen.getByText("인력 유출 위험")).toBeDefined();
  });

  it("위험_게이지에_ARIA_라벨이_있다", () => {
    render(<AttritionCard data={mockBenchmarkResponse.attrition} defaultInsightOpen={false} />);
    expect(screen.getByLabelText("인력 유출 위험도: moderate")).toBeDefined();
  });

  it("4단계_라벨을_모두_렌더링한다", () => {
    render(<AttritionCard data={mockBenchmarkResponse.attrition} defaultInsightOpen={false} />);
    expect(screen.getByText("낮음")).toBeDefined();
    expect(screen.getByText("주의")).toBeDefined();
    expect(screen.getAllByText("보통").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("높음")).toBeDefined();
  });

  it("데이터_행을_렌더링한다", () => {
    render(<AttritionCard data={mockBenchmarkResponse.attrition} defaultInsightOpen={false} />);
    expect(screen.getByText("최근 6개월 이직률")).toBeDefined();
    expect(screen.getByText("12.5%")).toBeDefined();
  });
});
