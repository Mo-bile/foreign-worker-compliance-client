import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/legal/changes",
}));

describe("Sidebar", () => {
  it("법령·리포트 항목이 렌더링된다", () => {
    render(<Sidebar />);
    expect(screen.getByText("법령·리포트")).toBeInTheDocument();
  });

  it("법령 변경 알림, 컴플라이언스 리포트 항목이 더 이상 존재하지 않는다", () => {
    render(<Sidebar />);
    expect(screen.queryByText("법령 변경 알림")).not.toBeInTheDocument();
    expect(screen.queryByText("컴플라이언스 리포트")).not.toBeInTheDocument();
  });

  it("법령·리포트의 href가 /legal이다", () => {
    render(<Sidebar />);
    const link = screen.getByText("법령·리포트").closest("a");
    expect(link).toHaveAttribute("href", "/legal");
  });

  it("/legal 하위 경로에서 법령·리포트가 active 상태다", () => {
    render(<Sidebar />);
    const link = screen.getByText("법령·리포트").closest("a");
    expect(link).toHaveClass("bg-secondary");
  });

  it("데드라인 관리 항목이 더 이상 존재하지 않는다", () => {
    render(<Sidebar />);
    expect(screen.queryByText("데드라인 관리")).not.toBeInTheDocument();
  });
});
