import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "@/components/legal/filter-bar";

describe("FilterBar", () => {
  it("renders all filter chips", () => {
    render(<FilterBar activeFilter="all" onFilterChange={vi.fn()} />);
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("영향있음")).toBeInTheDocument();
    expect(screen.getByText("조치필요")).toBeInTheDocument();
    expect(screen.getByText("확인완료")).toBeInTheDocument();
  });

  it("marks active chip with aria-pressed", () => {
    render(<FilterBar activeFilter="action_required" onFilterChange={vi.fn()} />);
    expect(screen.getByText("조치필요")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("전체")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onFilterChange when chip clicked", async () => {
    const onChange = vi.fn();
    render(<FilterBar activeFilter="all" onFilterChange={onChange} />);
    await userEvent.click(screen.getByText("조치필요"));
    expect(onChange).toHaveBeenCalledWith("action_required");
  });
});
