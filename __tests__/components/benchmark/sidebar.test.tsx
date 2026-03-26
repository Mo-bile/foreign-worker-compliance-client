import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/benchmark",
}));

describe("Sidebar benchmark nav", () => {
  it("사업장_건강검진_링크를_렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("사업장 건강검진")).toBeDefined();
  });

  it("benchmark_경로_링크가_있다", () => {
    render(<Sidebar />);
    const link = screen.getByText("사업장 건강검진").closest("a");
    expect(link?.getAttribute("href")).toBe("/benchmark");
  });
});
