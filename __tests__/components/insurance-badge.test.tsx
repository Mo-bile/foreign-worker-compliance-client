import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsuranceBadge } from "@/components/workers/insurance-badge";

describe("InsuranceBadge", () => {
  it("MANDATORY는_한글_라벨과_blue_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="MANDATORY" label="의무가입" />);
    const badge = screen.getByText("의무가입");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-blue");
  });

  it("FULL_MANDATORY는_blue_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="FULL_MANDATORY" label="전부 의무적용" />);
    const badge = screen.getByText("전부 의무적용");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-blue");
  });

  it("AUTO_BENEFITS_OPT_IN는_indigo_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="AUTO_BENEFITS_OPT_IN" label="자동가입(급여신청형)" />);
    const badge = screen.getByText("자동가입(급여신청형)");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-indigo");
  });

  it("OPTIONAL_ON_APPLICATION는_gray_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="OPTIONAL_ON_APPLICATION" label="신청시가입" />);
    const badge = screen.getByText("신청시가입");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-gray");
  });

  it("EXEMPT는_green_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="EXEMPT" label="가입제외" />);
    const badge = screen.getByText("가입제외");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-green");
  });

  it("알_수_없는_statusCode는_기본_스타일로_렌더링한다", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<InsuranceBadge statusCode={"UNKNOWN" as any} label="알수없음" />);
    expect(screen.getByText("알수없음")).toBeDefined();
  });
});
