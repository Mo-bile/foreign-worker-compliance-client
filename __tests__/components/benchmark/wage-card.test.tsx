import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WageCard } from "@/components/benchmark/wage-card";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";

describe("WageCard", () => {
  it("타이틀을_렌더링한다", () => {
    render(<WageCard data={mockBenchmarkResponse.wage} defaultInsightOpen={false} />);
    expect(screen.getByText("임금 경쟁력")).toBeDefined();
  });

  it("배지를_렌더링한다", () => {
    render(<WageCard data={mockBenchmarkResponse.wage} defaultInsightOpen={false} />);
    expect(screen.getByText("하위 30%")).toBeDefined();
  });

  it("데이터_행을_렌더링한다", () => {
    render(<WageCard data={mockBenchmarkResponse.wage} defaultInsightOpen={false} />);
    expect(screen.getByText("귀사 평균 임금")).toBeDefined();
    expect(screen.getByText("220만원")).toBeDefined();
  });

  it("백분위_바에_라벨이_있다", () => {
    render(<WageCard data={mockBenchmarkResponse.wage} defaultInsightOpen={false} />);
    expect(screen.getByLabelText("임금 백분위 30%")).toBeDefined();
  });
});
