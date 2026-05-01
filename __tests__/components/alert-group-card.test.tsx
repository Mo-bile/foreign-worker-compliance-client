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
    category: "other",
    timing: "immediate",
    href: "/deadlines?type=VISA_EXPIRY",
  },
  {
    deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
    label: "건강보험 취득신고",
    count: 3,
    urgency: "warning",
    category: "socialInsurance",
    timing: "immediate",
    href: "/deadlines?type=HEALTH_INSURANCE_ENROLLMENT",
  },
  {
    deadlineType: "EXIT_GUARANTEE_INSURANCE",
    label: "출국만기보험",
    count: 4,
    urgency: "critical",
    category: "guaranteeInsurance",
    timing: "immediate",
    href: "/deadlines?type=EXIT_GUARANTEE_INSURANCE",
  },
  {
    deadlineType: "CONTRACT_RENEWAL",
    label: "근로계약 갱신",
    count: 1,
    urgency: "caution",
    category: "other",
    timing: "scheduled",
    href: "/deadlines?type=CONTRACT_RENEWAL",
  },
] as readonly AlertGroup[];

describe("AlertGroupCard", () => {
  it("즉시_조치와_예정_관리를_구분하고_건수로_렌더링한다", () => {
    render(<AlertGroupCard alertGroups={mockGroups} />);
    expect(screen.getByText("즉시 조치")).toBeDefined();
    expect(screen.getByText("예정 관리")).toBeDefined();
    expect(screen.getByText("4대보험 신고 지연 3건")).toBeDefined();
    expect(screen.getByText("전용보험 가입 지연 4건")).toBeDefined();
    expect(screen.getByText("비자 만료 임박")).toBeDefined();
    expect(screen.getAllByText("2건").length).toBeGreaterThan(0);
    expect(screen.getByText("건강보험 취득신고")).toBeDefined();
    expect(screen.getAllByText("3건").length).toBeGreaterThan(0);
    expect(screen.queryByText("3명")).toBeNull();
  });

  it("전체_보기_링크가_올바른_href를_가진다", () => {
    render(<AlertGroupCard alertGroups={mockGroups} />);
    const links = screen.getAllByText("전체 보기 →");
    expect(links.length).toBe(4);
    expect(links.map((link) => link.closest("a")?.getAttribute("href")).sort()).toEqual(
      [
        "/deadlines?type=CONTRACT_RENEWAL",
        "/deadlines?type=EXIT_GUARANTEE_INSURANCE",
        "/deadlines?type=HEALTH_INSURANCE_ENROLLMENT",
        "/deadlines?type=VISA_EXPIRY",
      ].sort(),
    );
  });

  it("critical_urgency에_signal-red_배경이다", () => {
    render(<AlertGroupCard alertGroups={[mockGroups[0]]} />);
    const row = screen.getByText("비자 만료 임박").closest("[class]")?.parentElement;
    expect(row?.className).toContain("bg-signal-red-bg");
  });

  it("warning_urgency에_signal-orange_배경이다", () => {
    render(<AlertGroupCard alertGroups={[mockGroups[1]]} />);
    const row = screen.getByText("건강보험 취득신고").closest("[class]")?.parentElement;
    expect(row?.className).toContain("bg-signal-orange-bg");
  });

  it("caution_urgency에_signal-yellow_배경이다", () => {
    render(<AlertGroupCard alertGroups={[mockGroups[3]]} />);
    const row = screen.getByText("근로계약 갱신").closest("[class]")?.parentElement;
    expect(row?.className).toContain("bg-signal-yellow-bg");
  });

  it("빈_배열이면_빈_상태_메시지를_표시한다", () => {
    render(<AlertGroupCard alertGroups={[]} />);
    expect(screen.getByText("조치 알림이 없습니다")).toBeDefined();
  });
});
