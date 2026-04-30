import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/common/empty-state";

describe("EmptyState", () => {
  it("메시지를_렌더링한다", () => {
    render(<EmptyState message="내용이 없습니다" />);
    expect(screen.getByText("내용이 없습니다")).toBeInTheDocument();
  });

  it("action이_있으면_함께_렌더링한다", () => {
    render(<EmptyState message="없습니다" action={<button>등록</button>} />);
    expect(screen.getByText("없습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "등록" })).toBeInTheDocument();
  });

  it("variant_error이면_text-destructive_클래스를_적용한다", () => {
    render(<EmptyState message="에러 발생" variant="error" />);
    const p = screen.getByText("에러 발생");
    expect(p.className).toContain("text-destructive");
  });

  it("기본_variant는_text-destructive를_포함하지_않는다", () => {
    render(<EmptyState message="기본 상태" />);
    const p = screen.getByText("기본 상태");
    expect(p.className).not.toContain("text-destructive");
  });
});
