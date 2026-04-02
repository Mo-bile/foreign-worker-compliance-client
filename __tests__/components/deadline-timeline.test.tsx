import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeadlineTimeline } from "@/components/dashboard/deadline-timeline";
import type { TimelineItem } from "@/types/dashboard";

const mockItems: readonly TimelineItem[] = [
  { id: "1", date: "4월 5일", deadlineLabel: "비자 갱신", workerName: "Nguyen Van A", urgency: "overdue" },
  { id: "2", date: "4월 8일", deadlineLabel: "보험 가입", workerName: "Jose Garcia", urgency: "d7" },
  { id: "3", date: "4월 22일", deadlineLabel: "계약 갱신", workerName: "Li Jun", urgency: "d30" },
];

describe("DeadlineTimeline", () => {
  it("각_항목의_날짜_유형_근로자명을_렌더링한다", () => {
    render(<DeadlineTimeline items={mockItems} />);
    expect(screen.getByText("4월 5일")).toBeDefined();
    expect(screen.getByText("비자 갱신")).toBeDefined();
    expect(screen.getByText("Nguyen Van A")).toBeDefined();
  });

  it("헤더에_30일_타임라인_타이틀이_있다", () => {
    render(<DeadlineTimeline items={mockItems} />);
    expect(screen.getByText("30일 타임라인")).toBeDefined();
  });

  it("전체_보기_링크가_/compliance를_가리킨다", () => {
    render(<DeadlineTimeline items={mockItems} />);
    const link = screen.getByText("전체 보기 →");
    expect(link.closest("a")?.getAttribute("href")).toBe("/compliance");
  });

  it("overdue_urgency에_signal-red_색상_바가_있다", () => {
    render(<DeadlineTimeline items={[mockItems[0]]} />);
    const row = screen.getByText("Nguyen Van A").closest("[class]")?.parentElement;
    expect(row?.innerHTML).toContain("bg-signal-red");
  });

  it("빈_배열이면_빈_상태_메시지를_표시한다", () => {
    render(<DeadlineTimeline items={[]} />);
    expect(screen.getByText("30일 이내 예정 항목이 없습니다")).toBeDefined();
  });
});
