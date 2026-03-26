import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultVerdict } from "@/components/simulator/result-verdict";

describe("ResultVerdict", () => {
  const defaultProps = {
    verdict: "HIGH" as const,
    verdictText: "높음",
    summary: "배정 가능성이 양호합니다.",
    analyzedAt: "2026-03-24T14:32:00Z",
    dataSourceCount: 4,
  };

  it("판정_텍스트를_렌더링한다", () => {
    render(<ResultVerdict {...defaultProps} />);
    expect(screen.getByText(/높음/)).toBeDefined();
  });

  it("분석_완료_배지를_렌더링한다", () => {
    render(<ResultVerdict {...defaultProps} />);
    expect(screen.getByText("분석 완료")).toBeDefined();
  });

  it("데이터_소스_카운트를_표시한다", () => {
    render(<ResultVerdict {...defaultProps} />);
    expect(screen.getByText(/4개 데이터 소스/)).toBeDefined();
  });

  it("요약_텍스트를_렌더링한다", () => {
    render(<ResultVerdict {...defaultProps} />);
    expect(screen.getByText("배정 가능성이 양호합니다.")).toBeDefined();
  });

  it("분석_날짜를_포맷하여_표시한다", () => {
    render(<ResultVerdict {...defaultProps} />);
    expect(screen.getByText(/2026/)).toBeDefined();
  });
});
