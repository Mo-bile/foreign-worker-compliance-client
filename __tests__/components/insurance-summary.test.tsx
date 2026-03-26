import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsuranceSummary } from "@/components/dashboard/insurance-summary";
import type { InsuranceSummaryItem } from "@/types/dashboard";

const items: InsuranceSummaryItem[] = [
  { type: "national_pension", enrolled: 10, label: "국민연금", status: "ok", statusText: "✓ 가입" },
  { type: "health", enrolled: 11, label: "건강보험", status: "warn", statusText: "1 미가입" },
  { type: "employment", enrolled: 9, label: "고용보험", status: "warn", statusText: "1 미가입" },
  {
    type: "industrial_accident",
    enrolled: 12,
    label: "산재보험",
    status: "ok",
    statusText: "✓ 전원",
  },
];

describe("InsuranceSummary", () => {
  it("보험_유형_라벨을_렌더링한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("국민연금")).toBeDefined();
    expect(screen.getByText("건강보험")).toBeDefined();
    expect(screen.getByText("고용보험")).toBeDefined();
    expect(screen.getByText("산재보험")).toBeDefined();
  });

  it("가입_인원수를_렌더링한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("11")).toBeDefined();
  });

  it("상태_텍스트를_렌더링한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("✓ 가입")).toBeDefined();
    expect(screen.getAllByText("1 미가입").length).toBe(2);
  });

  it("카드_제목을_표시한다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByText("4대보험 현황")).toBeDefined();
  });

  it("보험_의무_안내_툴팁이_있다", () => {
    render(<InsuranceSummary items={items} />);
    expect(screen.getByTitle("비자 유형별 보험 가입 의무가 상이합니다")).toBeDefined();
  });
});
