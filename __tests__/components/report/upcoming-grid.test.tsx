import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UpcomingGrid } from "@/components/report/upcoming-grid";
import type { UpcomingItem } from "@/types/report";

describe("UpcomingGrid", () => {
  const items: UpcomingItem[] = [
    { title: "비자 만료", description: "2026.04.15", urgency: "urgent" },
    { title: "계약 만료", description: "2026.04.30", urgency: "warning" },
    { title: "보험료 납부", description: "2026.04.10", urgency: "normal" },
  ];

  it("renders all upcoming items", () => {
    render(<UpcomingGrid items={items} />);
    expect(screen.getByText("비자 만료")).toBeInTheDocument();
    expect(screen.getByText("계약 만료")).toBeInTheDocument();
    expect(screen.getByText("보험료 납부")).toBeInTheDocument();
  });

  it("applies correct urgency color classes", () => {
    render(<UpcomingGrid items={items} />);
    const urgentCard = screen.getByText("비자 만료").closest("div")!;
    const warningCard = screen.getByText("계약 만료").closest("div")!;
    const normalCard = screen.getByText("보험료 납부").closest("div")!;
    expect(urgentCard).toHaveClass("border-l-signal-red");
    expect(warningCard).toHaveClass("border-l-signal-orange");
    expect(normalCard).toHaveClass("border-l-signal-blue");
  });
});
