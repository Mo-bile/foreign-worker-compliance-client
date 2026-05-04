import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminationInfoCard } from "@/components/workers/termination-info-card";
import type { TerminationInfoDto } from "@/types/api";

const baseInfo: TerminationInfoDto = {
  endedAt: "2026-03-10",
  reason: "CONTRACT_EXPIRY",
  employerFault: null,
  memo: null,
  confirmed: true,
  systemInferred: false,
};

describe("TerminationInfoCard", () => {
  it("endedAt_과_reason_라벨이_노출된다", () => {
    render(<TerminationInfoCard terminationInfo={baseInfo} />);
    expect(screen.getByText("2026-03-10")).toBeDefined();
    expect(screen.getByText("계약만료")).toBeDefined();
  });

  it("systemInferred_true_시_자동_추론값_배지_노출", () => {
    render(<TerminationInfoCard terminationInfo={{ ...baseInfo, systemInferred: true }} />);
    expect(screen.getByText("시스템 자동 추론값")).toBeDefined();
  });

  it("systemInferred_false_시_배지_비노출", () => {
    render(<TerminationInfoCard terminationInfo={baseInfo} />);
    expect(screen.queryByText("시스템 자동 추론값")).toBeNull();
  });

  it("WORKPLACE_CHANGE_employerFault_true_시_예_표시", () => {
    render(
      <TerminationInfoCard
        terminationInfo={{ ...baseInfo, reason: "WORKPLACE_CHANGE", employerFault: true }}
      />,
    );
    expect(screen.getByText("예")).toBeDefined();
  });

  it("WORKPLACE_CHANGE_employerFault_false_시_아니오_표시", () => {
    render(
      <TerminationInfoCard
        terminationInfo={{ ...baseInfo, reason: "WORKPLACE_CHANGE", employerFault: false }}
      />,
    );
    expect(screen.getByText("아니오")).toBeDefined();
  });

  it("WORKPLACE_CHANGE_employerFault_null_시_확인_필요_표시", () => {
    render(
      <TerminationInfoCard
        terminationInfo={{ ...baseInfo, reason: "WORKPLACE_CHANGE", employerFault: null }}
      />,
    );
    expect(screen.getByText("확인 필요")).toBeDefined();
  });

  it("CONTRACT_EXPIRY_시_employerFault_행_비노출", () => {
    render(<TerminationInfoCard terminationInfo={baseInfo} />);
    expect(screen.queryByText("사업주 귀책 여부")).toBeNull();
  });

  it("memo_존재_시_노출_null_시_비노출", () => {
    const { rerender } = render(
      <TerminationInfoCard terminationInfo={{ ...baseInfo, memo: "본인 사유로 조기 퇴사" }} />,
    );
    expect(screen.getByText("본인 사유로 조기 퇴사")).toBeDefined();

    rerender(<TerminationInfoCard terminationInfo={{ ...baseInfo, memo: null }} />);
    expect(screen.queryByText("메모")).toBeNull();
  });

  it("4대보험_안내_텍스트_항상_노출", () => {
    render(<TerminationInfoCard terminationInfo={baseInfo} />);
    expect(screen.getByText(/4대보험 자격상실 신고도 잊지 마세요/)).toBeDefined();
  });
});
