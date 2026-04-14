import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertGroupCard } from "@/components/dashboard/alert-group-card";
import type { AlertGroup } from "@/types/dashboard";

const mockGroups: readonly AlertGroup[] = [
  {
    deadlineType: "VISA_EXPIRY",
    label: "비자 만료 임박",
    count: 2,
    urgency: "critical",
    href: "/compliance?type=VISA_EXPIRY",
  },
  {
    deadlineType: "INSURANCE_ENROLLMENT",
    label: "보험 가입 필요",
    count: 3,
    urgency: "warning",
    href: "/compliance?type=INSURANCE_ENROLLMENT",
  },
  {
    deadlineType: "CONTRACT_RENEWAL",
    label: "근로계약 갱신",
    count: 1,
    urgency: "caution",
    href: "/compliance?type=CONTRACT_RENEWAL",
  },
];

describe("AlertGroupCard", () => {
  it("각_그룹의_유형명과_인원수를_렌더링한다", () => {
    render(<AlertGroupCard alertGroups={mockGroups} />);
    expect(screen.getByText("비자 만료 임박")).toBeDefined();
    expect(screen.getByText("2명")).toBeDefined();
    expect(screen.getByText("보험 가입 필요")).toBeDefined();
    expect(screen.getByText("3명")).toBeDefined();
  });

  it("전체_보기_링크가_올바른_href를_가진다", () => {
    render(<AlertGroupCard alertGroups={mockGroups} />);
    const links = screen.getAllByText("전체 보기 →");
    expect(links.length).toBe(3);
    expect(links[0].closest("a")?.getAttribute("href")).toBe("/compliance?type=VISA_EXPIRY");
  });

  it("critical_urgency에_signal-red_배경이다", () => {
    render(<AlertGroupCard alertGroups={[mockGroups[0]]} />);
    const row = screen.getByText("비자 만료 임박").closest("[class]")?.parentElement;
    expect(row?.className).toContain("bg-signal-red-bg");
  });

  it("warning_urgency에_signal-orange_배경이다", () => {
    render(<AlertGroupCard alertGroups={[mockGroups[1]]} />);
    const row = screen.getByText("보험 가입 필요").closest("[class]")?.parentElement;
    expect(row?.className).toContain("bg-signal-orange-bg");
  });

  it("caution_urgency에_signal-yellow_배경이다", () => {
    render(<AlertGroupCard alertGroups={[mockGroups[2]]} />);
    const row = screen.getByText("근로계약 갱신").closest("[class]")?.parentElement;
    expect(row?.className).toContain("bg-signal-yellow-bg");
  });

  it("빈_배열이면_빈_상태_메시지를_표시한다", () => {
    render(<AlertGroupCard alertGroups={[]} />);
    expect(screen.getByText("긴급 알림이 없습니다")).toBeDefined();
  });
});
