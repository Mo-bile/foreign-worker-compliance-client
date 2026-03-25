import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeadlineMini } from "@/components/dashboard/deadline-mini";
import type { DashboardDeadline } from "@/types/dashboard";

const deadlines: DashboardDeadline[] = [
  {
    id: "1",
    title: "비자 연장",
    workerName: "Nguyen",
    visaType: "E-9",
    dDay: 4,
    urgency: "overdue",
  },
  { id: "2", title: "보험 신고", workerName: "Pham", visaType: "E-9", dDay: 0, urgency: "d7" },
  { id: "3", title: "계약 갱신", workerName: "Rahman", visaType: "H-2", dDay: 21, urgency: "d30" },
];

describe("DeadlineMini", () => {
  it("데드라인_제목을_렌더링한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("비자 연장")).toBeDefined();
    expect(screen.getByText("보험 신고")).toBeDefined();
    expect(screen.getByText("계약 갱신")).toBeDefined();
  });

  it("근로자명과_비자타입을_렌더링한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("Nguyen · E-9")).toBeDefined();
  });

  it("D-day를_렌더링한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("D-4")).toBeDefined();
    expect(screen.getByText("D-0")).toBeDefined();
    expect(screen.getByText("D-21")).toBeDefined();
  });

  it("카드_제목을_표시한다", () => {
    render(<DeadlineMini deadlines={deadlines} />);
    expect(screen.getByText("다가오는 데드라인")).toBeDefined();
  });
});
