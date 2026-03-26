import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendCard } from "@/components/benchmark/trend-card";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";

describe("TrendCard", () => {
  it("타이틀을_렌더링한다", () => {
    render(<TrendCard data={mockBenchmarkResponse.trend} defaultInsightOpen={false} />);
    expect(screen.getByText("점수 추이")).toBeDefined();
  });

  it("테이블_헤더를_렌더링한다", () => {
    render(<TrendCard data={mockBenchmarkResponse.trend} defaultInsightOpen={false} />);
    expect(screen.getByText("항목")).toBeDefined();
    expect(screen.getByText("변동")).toBeDefined();
  });

  it("종합_행을_렌더링한다", () => {
    render(<TrendCard data={mockBenchmarkResponse.trend} defaultInsightOpen={false} />);
    expect(screen.getByText("종합")).toBeDefined();
  });

  it("3개월_데이터를_렌더링한다", () => {
    render(<TrendCard data={mockBenchmarkResponse.trend} defaultInsightOpen={false} />);
    expect(screen.getByText("1월")).toBeDefined();
    expect(screen.getByText("2월")).toBeDefined();
    expect(screen.getByText("3월")).toBeDefined();
  });

  it("변동_값이_양수이면_상승_표시한다", () => {
    render(<TrendCard data={mockBenchmarkResponse.trend} defaultInsightOpen={false} />);
    // 종합: 73-69 = +4
    const changeValues = screen.getAllByText("+4");
    expect(changeValues.length).toBeGreaterThan(0);
  });
});
