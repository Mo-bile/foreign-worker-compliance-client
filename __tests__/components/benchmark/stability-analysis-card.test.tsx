import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("교정된 라벨을 사용한다", () => {
    render(<StabilityAnalysisCard stabilityAnalysis={stability} />);

    expect(screen.getByText(/귀사 최근 1년 이직률/)).toBeInTheDocument();
    expect(screen.getByText(/E-9 이전 직장 퇴사 사유/)).toBeInTheDocument();
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

  it("DataSourceMeta 토글이 있다", () => {
    render(<StabilityAnalysisCard stabilityAnalysis={stability} />);

    expect(screen.getByText("데이터 정보")).toBeInTheDocument();
  });

  it("CTA 클릭 가능 항목이 onReasonClick을 호출한다", () => {
    const onReasonClick = vi.fn();
    render(
      <StabilityAnalysisCard
        stabilityAnalysis={stability}
        onReasonClick={onReasonClick}
      />,
    );

    fireEvent.click(screen.getByText(/임금이 낮아서/));
    expect(onReasonClick).toHaveBeenCalledWith("계약");
  });

  it("betterJob은 클릭 불가이다", () => {
    const onReasonClick = vi.fn();
    render(
      <StabilityAnalysisCard
        stabilityAnalysis={stability}
        onReasonClick={onReasonClick}
      />,
    );

    const betterJobBtn = screen.getByText(/더 좋은 일자리/).closest("button");
    expect(betterJobBtn).toBeDisabled();
  });
});
