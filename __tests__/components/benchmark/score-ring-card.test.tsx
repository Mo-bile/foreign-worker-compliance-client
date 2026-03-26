import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreRingCard } from "@/components/benchmark/score-ring-card";
import type { BenchmarkScore } from "@/types/benchmark";

const mockScore: BenchmarkScore = {
  total: 73,
  grade: "B+",
  change: 4,
  categories: [
    { label: "보험 가입", score: 92, color: "green" },
    { label: "데드라인", score: 65, color: "orange" },
    { label: "임금 경쟁력", score: 62, color: "yellow" },
  ],
};

describe("ScoreRingCard", () => {
  it("총점을_렌더링한다", () => {
    render(<ScoreRingCard score={mockScore} analyzedAt="2026-03-15T09:00:00Z" />);
    expect(screen.getByText("73")).toBeDefined();
  });

  it("등급을_렌더링한다", () => {
    render(<ScoreRingCard score={mockScore} analyzedAt="2026-03-15T09:00:00Z" />);
    expect(screen.getByText("B+")).toBeDefined();
  });

  it("카테고리_바_3개를_렌더링한다", () => {
    render(<ScoreRingCard score={mockScore} analyzedAt="2026-03-15T09:00:00Z" />);
    expect(screen.getByText("보험 가입")).toBeDefined();
    expect(screen.getByText("데드라인")).toBeDefined();
    expect(screen.getByText("임금 경쟁력")).toBeDefined();
  });

  it("ScoreRing에_meter_역할이_있다", () => {
    render(<ScoreRingCard score={mockScore} analyzedAt="2026-03-15T09:00:00Z" />);
    const meter = screen.getByRole("meter", { name: "컴플라이언스 점수" });
    expect(meter.getAttribute("aria-valuenow")).toBe("73");
  });

  it("변동_점수를_표시한다", () => {
    render(<ScoreRingCard score={mockScore} analyzedAt="2026-03-15T09:00:00Z" />);
    expect(screen.getByText(/\+4점/)).toBeDefined();
  });
});
