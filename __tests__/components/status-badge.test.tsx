import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/compliance/status-badge";

describe("StatusBadge", () => {
  it("OVERDUE는_기한초과_텍스트를_렌더링한다", () => {
    render(<StatusBadge status="OVERDUE" />);
    expect(screen.getByText("기한초과")).toBeDefined();
  });

  it("URGENT는_긴급_텍스트를_렌더링한다", () => {
    render(<StatusBadge status="URGENT" />);
    expect(screen.getByText("긴급")).toBeDefined();
  });

  it("APPROACHING는_임박_텍스트를_렌더링한다", () => {
    render(<StatusBadge status="APPROACHING" />);
    expect(screen.getByText("임박")).toBeDefined();
  });

  it("PENDING는_대기_텍스트를_렌더링한다", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText("대기")).toBeDefined();
  });

  it("COMPLETED는_완료_텍스트를_렌더링한다", () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText("완료")).toBeDefined();
  });
});
