import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LegalChangeSummaryGrid } from "@/components/report/legal-change-summary";
import type { LegalChangeSummary } from "@/types/report";

describe("LegalChangeSummaryGrid", () => {
  const items: LegalChangeSummary[] = [
    { title: "최저임금법", description: "개정 내용", color: "red" },
    { title: "고용허가제", description: "시행규칙 변경", color: "orange" },
  ];

  it("renders all summary items", () => {
    render(<LegalChangeSummaryGrid items={items} />);
    expect(screen.getByText("최저임금법")).toBeInTheDocument();
    expect(screen.getByText("고용허가제")).toBeInTheDocument();
  });

  it("applies correct border color classes", () => {
    render(<LegalChangeSummaryGrid items={items} />);
    const redCard = screen.getByText("최저임금법").closest("div")!;
    const orangeCard = screen.getByText("고용허가제").closest("div")!;
    expect(redCard).toHaveClass("border-l-signal-red");
    expect(orangeCard).toHaveClass("border-l-signal-orange");
  });
});
