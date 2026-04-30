import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BenchmarkStatCards } from "@/components/benchmark/benchmark-stat-cards";
import { mockBenchmarkResponse, mockBenchmarkEmpty } from "@/mocks/benchmark-data";

describe("BenchmarkStatCards", () => {
  it("정상 데이터의 4축 요약을 표시한다", () => {
    render(<BenchmarkStatCards benchmark={mockBenchmarkResponse} />);

    expect(screen.getByText("임금 수준 비교")).toBeInTheDocument();
    expect(screen.getByText(/260만원/)).toBeInTheDocument();
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/8 \/ 10/)).toBeInTheDocument();
    expect(screen.getByText(/경기/)).toBeInTheDocument();
  });

  it("nullable 축은 미입력으로 표시한다", () => {
    render(<BenchmarkStatCards benchmark={mockBenchmarkEmpty} />);

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
    const labels = screen.getAllByText("미입력");
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });
});
