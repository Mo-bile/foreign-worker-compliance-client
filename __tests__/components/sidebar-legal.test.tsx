import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/legal-changes",
}));

describe("Sidebar - Legal & Report Links", () => {
  it("법령_변경_알림_링크를_렌더링한다", () => {
    render(<Sidebar />);
    const link = screen.getByText("법령 변경 알림");
    expect(link).toBeDefined();
    expect(link.closest("a")?.getAttribute("href")).toBe("/legal-changes");
  });

  it("컴플라이언스_리포트_링크를_렌더링한다", () => {
    render(<Sidebar />);
    const link = screen.getByText("컴플라이언스 리포트");
    expect(link).toBeDefined();
    expect(link.closest("a")?.getAttribute("href")).toBe("/reports");
  });
});
