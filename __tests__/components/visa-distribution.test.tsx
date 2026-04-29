import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisaDistribution } from "@/components/dashboard/visa-distribution";
import type { VisaDistributionItem } from "@/types/dashboard";

const items: VisaDistributionItem[] = [
  { type: "E9", count: 8, percentage: 66.7 },
  { type: "H2", count: 3, percentage: 25.0 },
  { type: "E7", count: 1, percentage: 8.3 },
];

describe("VisaDistribution", () => {
  it("비자_유형_라벨을_렌더링한다", () => {
    render(<VisaDistribution items={items} />);
    expect(screen.getByText("고용허가제 일반외국인")).toBeDefined();
    expect(screen.getByText("외국국적동포")).toBeDefined();
    expect(screen.getByText("전문직")).toBeDefined();
  });

  it("인원수를_렌더링한다", () => {
    render(<VisaDistribution items={items} />);
    expect(screen.getByText("8명")).toBeDefined();
    expect(screen.getByText("3명")).toBeDefined();
    expect(screen.getByText("1명")).toBeDefined();
  });

  it("카드_제목을_표시한다", () => {
    render(<VisaDistribution items={items} />);
    expect(screen.getByText("비자 유형별 분포")).toBeDefined();
  });
});
