import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoSuggestedDeductionsCard } from "@/components/simulator/auto-suggested-deductions-card";
import type { AutoSuggestedDeductionDisplay } from "@/types/simulator";

const mockSuggestion: AutoSuggestedDeductionDisplay = {
  code: "LABOR_VIOLATION_MODERATE",
  displayName: "노동관계법 위반(폭행폭언·임금체불)",
  pointsLabel: "-6점",
  reason: "최근 1년 사업주 귀책 사업장 변경 1명",
  triggerCountLabel: "관련 워커 1명",
};

describe("AutoSuggestedDeductionsCard", () => {
  let onResubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onResubmit = vi.fn();
  });

  it("autoSuggested_빈_배열_시_카드_자체_비노출", () => {
    const { container } = render(
      <AutoSuggestedDeductionsCard autoSuggested={[]} onResubmit={onResubmit} isPending={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("1건_fixture_시_displayName_pointsLabel_reason_triggerCountLabel_모두_노출", () => {
    render(
      <AutoSuggestedDeductionsCard
        autoSuggested={[mockSuggestion]}
        onResubmit={onResubmit}
        isPending={false}
      />,
    );
    expect(screen.getByText("노동관계법 위반(폭행폭언·임금체불)")).toBeDefined();
    expect(screen.getByText("-6점")).toBeDefined();
    expect(screen.getByText("최근 1년 사업주 귀책 사업장 변경 1명")).toBeDefined();
    expect(screen.getByText("관련 워커 1명")).toBeDefined();
  });

  it("체크박스_토글_체크_후_다시_클릭_시_해제", async () => {
    render(
      <AutoSuggestedDeductionsCard
        autoSuggested={[mockSuggestion]}
        onResubmit={onResubmit}
        isPending={false}
      />,
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it("체크_0개_시_다시_시뮬레이션_버튼_비활성화", () => {
    render(
      <AutoSuggestedDeductionsCard
        autoSuggested={[mockSuggestion]}
        onResubmit={onResubmit}
        isPending={false}
      />,
    );
    const button = screen.getByRole("button", { name: /다시 시뮬레이션/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("1개_체크_후_버튼_클릭_시_onResubmit_with_code_호출", async () => {
    render(
      <AutoSuggestedDeductionsCard
        autoSuggested={[mockSuggestion]}
        onResubmit={onResubmit}
        isPending={false}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: /다시 시뮬레이션/ }));
    expect(onResubmit).toHaveBeenCalledWith(["LABOR_VIOLATION_MODERATE"]);
  });
});
