import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComplianceGauge } from "@/components/dashboard/compliance-gauge";
import type { ComplianceScoreData } from "@/types/dashboard";

const scoreData: ComplianceScoreData = {
  score: 73,
  breakdown: [
    { label: "보험 가입", score: 92 },
    { label: "주요 기한 준수", score: 65 },
    { label: "임금 경쟁력", score: 62 },
  ],
};

describe("ComplianceGauge", () => {
  it("총점을_표시한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("통합 준수 점수")).toBeDefined();
    expect(screen.getByText("73")).toBeDefined();
  });

  it("100점_만점_라벨을_표시한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("100점 만점")).toBeDefined();
  });

  it("breakdown_항목을_렌더링한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("보험 가입")).toBeDefined();
    expect(screen.getByText("92")).toBeDefined();
    expect(screen.getByText("주요 기한 준수")).toBeDefined();
    expect(screen.getByText("65")).toBeDefined();
    expect(screen.getByText("임금 경쟁력")).toBeDefined();
    expect(screen.getByText("62")).toBeDefined();
  });

  it("등급_스케일을_표시한다", () => {
    render(<ComplianceGauge data={scoreData} />);
    expect(screen.getByText("우수")).toBeDefined();
    expect(screen.getByText("양호")).toBeDefined();
    expect(screen.getByText("주의")).toBeDefined();
    expect(screen.getByText("위험")).toBeDefined();
  });

  it("SVG_게이지를_렌더링한다", () => {
    const { container } = render(<ComplianceGauge data={scoreData} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
