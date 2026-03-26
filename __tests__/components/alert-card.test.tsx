import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertCard } from "@/components/dashboard/alert-card";
import type { DashboardAlert } from "@/types/dashboard";

const criticalAlert: DashboardAlert = {
  id: "1",
  level: "critical",
  title: "비자 만료 임박 — Nguyen Van A",
  description: "E-9 비자가 2026.03.28에 만료됩니다.",
  dDay: 4,
  badgeText: "D-4",
  actions: [
    { label: "비자 연장 신청", href: "/workers/1" },
    { label: "근로자 상세", href: "/workers/1" },
  ],
};

const warningAlert: DashboardAlert = {
  id: "2",
  level: "warning",
  title: "건강보험 미가입 — Pham Thi B",
  description: "입사 후 14일이 경과했으나 건강보험 취득신고가 완료되지 않았습니다.",
  dDay: 0,
  badgeText: "D-0",
  actions: [
    { label: "일정 확인", href: "/deadlines" },
    { label: "조치하기", href: "/workers/2" },
  ],
};

const infoAlert: DashboardAlert = {
  id: "3",
  level: "info",
  title: "법령 변경",
  description: "최저임금 변경",
  dDay: null,
  badgeText: "정보",
  actions: [{ label: "자세히 보기", href: "/legal-changes" }],
};

describe("AlertCard", () => {
  it("제목과_설명을_렌더링한다", () => {
    render(<AlertCard alert={criticalAlert} />);
    expect(screen.getByText("비자 만료 임박 — Nguyen Van A")).toBeDefined();
    expect(screen.getByText("E-9 비자가 2026.03.28에 만료됩니다.")).toBeDefined();
  });

  it("뱃지_텍스트를_표시한다", () => {
    render(<AlertCard alert={criticalAlert} />);
    expect(screen.getByText("D-4")).toBeDefined();
  });

  it("액션_버튼들을_렌더링한다", () => {
    render(<AlertCard alert={criticalAlert} />);
    expect(screen.getByText("비자 연장 신청")).toBeDefined();
    expect(screen.getByText("근로자 상세")).toBeDefined();
  });

  it("critical_레벨에_signal-red-bg_배경이다", () => {
    const { container } = render(<AlertCard alert={criticalAlert} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-red-bg");
  });

  it("warning_레벨에_signal-orange-bg_배경이다", () => {
    const { container } = render(<AlertCard alert={warningAlert} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-orange-bg");
  });

  it("info_레벨에_signal-blue-bg_배경이다", () => {
    const { container } = render(<AlertCard alert={infoAlert} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-blue-bg");
  });
});
