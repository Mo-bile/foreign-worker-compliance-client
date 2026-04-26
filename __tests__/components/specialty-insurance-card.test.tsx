import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpecialtyInsuranceCard } from "@/components/workers/specialty-insurance-card";
import type { ComplianceDeadlineResponse } from "@/types/api";

function createDeadline(
  overrides: Partial<ComplianceDeadlineResponse> = {},
): ComplianceDeadlineResponse {
  return {
    id: overrides.id ?? 1,
    workerId: overrides.workerId ?? 1,
    workerName: overrides.workerName ?? "테스트",
    deadlineType: overrides.deadlineType ?? "EXIT_GUARANTEE_INSURANCE",
    dueDate: overrides.dueDate ?? "2026-05-10",
    status: overrides.status ?? "APPROACHING",
    description: overrides.description ?? "출국만기보험 가입",
  };
}

describe("SpecialtyInsuranceCard", () => {
  it("E9_비자에_전용보험_카드를_렌더링한다", () => {
    render(<SpecialtyInsuranceCard visaType="E9" deadlines={[]} />);
    expect(screen.getByText("전용보험 (E-9/H-2)")).toBeInTheDocument();
  });

  it("H2_비자에_전용보험_카드를_렌더링한다", () => {
    render(<SpecialtyInsuranceCard visaType="H2" deadlines={[]} />);
    expect(screen.getByText("전용보험 (E-9/H-2)")).toBeInTheDocument();
  });

  it("F2_비자에_렌더링하지_않는다", () => {
    const { container } = render(<SpecialtyInsuranceCard visaType="F2" deadlines={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("사업주_의무_2종을_표시한다", () => {
    render(<SpecialtyInsuranceCard visaType="E9" deadlines={[]} />);
    expect(screen.getByText("출국만기보험")).toBeInTheDocument();
    expect(screen.getByText("임금체불보증보험")).toBeInTheDocument();
  });

  it("근로자_의무_2종을_표시한다", () => {
    render(<SpecialtyInsuranceCard visaType="E9" deadlines={[]} />);
    expect(screen.getByText("귀국비용보험")).toBeInTheDocument();
    expect(screen.getByText("상해보험")).toBeInTheDocument();
  });

  it("사업주_의무에_데드라인이_있으면_상태를_표시한다", () => {
    const deadlines = [createDeadline({ deadlineType: "EXIT_GUARANTEE_INSURANCE", status: "URGENT" })];
    render(<SpecialtyInsuranceCard visaType="E9" deadlines={deadlines} />);
    expect(screen.getByText("긴급")).toBeInTheDocument();
  });

  it("데드라인이_없으면_미등록_표시", () => {
    render(<SpecialtyInsuranceCard visaType="E9" deadlines={[]} />);
    expect(screen.getAllByText("데드라인 미등록")).toHaveLength(2);
  });

  it("면책_문구를_표시한다", () => {
    render(<SpecialtyInsuranceCard visaType="E9" deadlines={[]} />);
    expect(screen.getByText(/법적 자문이 아닙니다/)).toBeInTheDocument();
  });

  it("H2_비자에_신규발급중단_배지를_표시한다", () => {
    render(<SpecialtyInsuranceCard visaType="H2" deadlines={[]} />);
    expect(screen.getByText("신규 발급 중단")).toBeInTheDocument();
  });
});
