import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChecklistItemRow } from "@/components/report/checklist-item";

describe("ChecklistItemRow", () => {
  it("renders done status with check icon", () => {
    render(
      <ChecklistItemRow
        item={{ id: "c1", title: "고용변동 신고", description: "완료", status: "done", date: "03.05" }}
      />,
    );
    expect(screen.getByText("고용변동 신고")).toBeInTheDocument();
    expect(screen.getByLabelText("완료")).toBeInTheDocument();
  });

  it("renders miss status with warning icon", () => {
    render(
      <ChecklistItemRow
        item={{ id: "p1", title: "비자 연장", description: "미완료", status: "miss", badge: { text: "D-4", color: "red" } }}
      />,
    );
    expect(screen.getByLabelText("미완료")).toBeInTheDocument();
    expect(screen.getByText("D-4")).toBeInTheDocument();
  });

  it("renders pending status", () => {
    render(
      <ChecklistItemRow
        item={{ id: "p3", title: "최저임금 대응", description: "진행중", status: "pending" }}
      />,
    );
    expect(screen.getByLabelText("진행중")).toBeInTheDocument();
  });
});
