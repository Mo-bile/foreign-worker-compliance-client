import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StabilityAnalysisCard } from "@/components/benchmark/stability-analysis-card";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";

describe("StabilityAnalysisCard", () => {
  const stability = mockBenchmarkResponse.stabilityAnalysis!;

  it("귀사 이직률을 산출 근거와 함께 표시한다", () => {
    render(<StabilityAnalysisCard stabilityAnalysis={stability} />);

    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/퇴사 3명/)).toBeInTheDocument();
    expect(screen.getByText(/외국인 24명/)).toBeInTheDocument();
  });

  it("전국 퇴사사유를 참고 라벨과 함께 표시한다", () => {
    render(<StabilityAnalysisCard stabilityAnalysis={stability} />);

    expect(screen.getByText(/전국 E-9 퇴사사유 분포/)).toBeInTheDocument();
    expect(screen.getByText(/KOSIS/)).toBeInTheDocument();
  });

  it("nationalTurnoverDesireRate를 직접 노출하지 않는다", () => {
    render(<StabilityAnalysisCard stabilityAnalysis={stability} />);

    expect(screen.queryByText("10.8%")).not.toBeInTheDocument();
    expect(screen.queryByText(/이직희망률/)).not.toBeInTheDocument();
  });

  it("면책 안내를 표시한다", () => {
    render(<StabilityAnalysisCard stabilityAnalysis={stability} />);

    expect(screen.getByText(/별개 지표/)).toBeInTheDocument();
  });
});
