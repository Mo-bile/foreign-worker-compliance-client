import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForeignWorkerStatusSection } from "@/components/settings/foreign-worker-status-section";
import { mockCompanyDerivedCounts } from "@/__tests__/fixtures/company";

describe("ForeignWorkerStatusSection", () => {
  it("derivedCounts_5_필드_숫자가_정확히_노출된다", () => {
    render(
      <ForeignWorkerStatusSection
        derivedCounts={{
          ...mockCompanyDerivedCounts,
          activeForeignWorkerCount: 9,
          upcomingForeignWorkerCount: 2,
          reviewRequiredForeignWorkerCount: 3,
          recentYearEndedForeignWorkerCount: 1,
          activeE9WorkerCount: 7,
        }}
      />,
    );
    expect(screen.getByText("9명")).toBeDefined();
    expect(screen.getByText("2명")).toBeDefined();
    expect(screen.getByText("3명")).toBeDefined();
    expect(screen.getByText("1명")).toBeDefined();
    expect(screen.getByText("7명")).toBeDefined();
  });

  it("reviewRequired_0_초과_시_확인하기_링크_노출_workers_경로", () => {
    render(
      <ForeignWorkerStatusSection
        derivedCounts={{ ...mockCompanyDerivedCounts, reviewRequiredForeignWorkerCount: 3 }}
      />,
    );
    const link = screen.getByRole("link", { name: /확인하기/ });
    expect(link.getAttribute("href")).toBe("/workers");
  });

  it("reviewRequired_0_시_확인하기_링크_비노출", () => {
    render(
      <ForeignWorkerStatusSection
        derivedCounts={{ ...mockCompanyDerivedCounts, reviewRequiredForeignWorkerCount: 0 }}
      />,
    );
    expect(screen.queryByRole("link", { name: /확인하기/ })).toBeNull();
  });

  it("E9_카드에_힌트_텍스트_노출", () => {
    render(<ForeignWorkerStatusSection derivedCounts={mockCompanyDerivedCounts} />);
    expect(screen.getByText("E-9 고용허가 시뮬레이션 기준")).toBeDefined();
  });

  it("4_상태_라벨_모두_렌더된다", () => {
    render(<ForeignWorkerStatusSection derivedCounts={mockCompanyDerivedCounts} />);
    expect(screen.getByText("재직중 (전체)")).toBeDefined();
    expect(screen.getByText("입사 예정")).toBeDefined();
    expect(screen.getByText("계약종료 확인 필요")).toBeDefined();
    expect(screen.getByText("최근 1년 고용종료")).toBeDefined();
  });
});
