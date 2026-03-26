import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DependencyCard } from "@/components/benchmark/dependency-card";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";
import type { ReactNode } from "react";

// Mock Recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("DependencyCard", () => {
  it("타이틀을_렌더링한다", () => {
    render(<DependencyCard data={mockBenchmarkResponse.dependency} defaultInsightOpen={false} />);
    expect(screen.getByText("외국인 의존도")).toBeDefined();
  });

  it("배지를_렌더링한다", () => {
    render(<DependencyCard data={mockBenchmarkResponse.dependency} defaultInsightOpen={false} />);
    expect(screen.getByText("+4.6%p 높음")).toBeDefined();
  });

  it("도넛_차트_컨테이너를_렌더링한다", () => {
    render(<DependencyCard data={mockBenchmarkResponse.dependency} defaultInsightOpen={false} />);
    expect(screen.getByLabelText("외국인 의존도 차트")).toBeDefined();
  });

  it("데이터_행을_렌더링한다", () => {
    render(<DependencyCard data={mockBenchmarkResponse.dependency} defaultInsightOpen={false} />);
    expect(screen.getByText("귀사 외국인 비율")).toBeDefined();
    expect(screen.getByText("26.7%")).toBeDefined();
  });
});
