import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/compliance",
}));

describe("Sidebar - Category Groups", () => {
  it("카테고리_그룹_라벨을_렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("메인")).toBeDefined();
    expect(screen.getByText("고용 전")).toBeDefined();
    expect(screen.getByText("고용 후")).toBeDefined();
    expect(screen.getByText("지속 관리")).toBeDefined();
  });

  it("데드라인_관리_링크를_렌더링한다", () => {
    render(<Sidebar />);
    const link = screen.getByText("데드라인 관리");
    expect(link).toBeDefined();
    expect(link.closest("a")?.getAttribute("href")).toBe("/compliance");
  });

  it("데드라인_관리_경로에서_활성_상태를_표시한다", () => {
    render(<Sidebar />);
    const link = screen.getByText("데드라인 관리").closest("a");
    expect(link?.className).toContain("bg-secondary");
  });
});
