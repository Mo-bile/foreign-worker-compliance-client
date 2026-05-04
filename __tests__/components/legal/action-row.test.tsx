import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActionRow } from "@/components/legal/action-row";
import type { LegalAction } from "@/types/legal";

describe("ActionRow", () => {
  it("renders all action buttons", () => {
    const actions: LegalAction[] = [
      { label: "계약서 갱신 시작", primary: true },
      { label: "확인 완료 처리", primary: false },
    ];
    render(<ActionRow actions={actions} />);
    expect(screen.getByText("계약서 갱신 시작")).toBeInTheDocument();
    expect(screen.getByText("확인 완료 처리")).toBeInTheDocument();
  });
});
