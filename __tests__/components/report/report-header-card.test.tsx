import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReportHeaderCard } from "@/components/report/report-header-card";

describe("ReportHeaderCard", () => {
  it("renders score and title", () => {
    render(
      <ReportHeaderCard
        title="2026년 3월 리포트"
        period="안산제조 주식회사"
        score={73}
        scoreChange={4}
        aiSummary="<p>테스트</p>"
      />,
    );
    expect(screen.getByText("73")).toBeInTheDocument();
    expect(screen.getByText("2026년 3월 리포트")).toBeInTheDocument();
    expect(screen.getByText(/\+4/)).toBeInTheDocument();
  });
});
