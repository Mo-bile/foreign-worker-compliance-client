import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar - Simulator Link", () => {
  it("E-9_고용허가_예상_계산_링크를_렌더링한다", () => {
    render(<Sidebar />);
    const link = screen.getByText("E-9 고용허가 예상 계산");
    expect(link).toBeDefined();
    expect(link.closest("a")?.getAttribute("href")).toBe("/simulator");
  });
});
