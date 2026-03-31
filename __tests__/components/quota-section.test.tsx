import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuotaSection } from "@/components/simulator/quota-section";
import type { QuotaDisplayData } from "@/types/simulator";

const mockData: QuotaDisplayData = {
  industry: "식료품제조업",
  currentYearQuota: "38,000명",
  yearRows: [
    { year: 2024, quotaCount: "34,000명", source: "제46차", isCurrent: false },
    { year: 2025, quotaCount: "36,000명", source: "제47차", isCurrent: false },
    { year: 2026, quotaCount: "38,000명", source: "제48차", isCurrent: true },
  ],
};

describe("QuotaSection", () => {
  it("업종과 금년 쿼터를 표시한다", () => {
    render(<QuotaSection data={mockData} defaultOpen />);
    expect(screen.getAllByText("38,000명").length).toBeGreaterThan(0);
  });

  it("연도별 추이 테이블을 렌더링한다", () => {
    render(<QuotaSection data={mockData} defaultOpen />);
    expect(screen.getByText("34,000명")).toBeDefined();
    expect(screen.getByText("36,000명")).toBeDefined();
  });

  it("각 row에 source를 표시한다", () => {
    render(<QuotaSection data={mockData} defaultOpen />);
    expect(screen.getByText("제46차")).toBeDefined();
    expect(screen.getByText("제48차")).toBeDefined();
  });

  it("차수별 컬럼이 없다", () => {
    const { container } = render(<QuotaSection data={mockData} defaultOpen />);
    expect(container.textContent).not.toContain("경쟁률");
  });
});
