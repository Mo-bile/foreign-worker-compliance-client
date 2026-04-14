import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: 1 }),
}));

vi.mock("@/lib/queries/use-compliance-report", () => ({
  useComplianceReport: () => ({
    data: {
      id: "rpt-1",
      title: "2026년 3월 리포트",
      period: "안산제조 주식회사",
      score: 73,
      scoreChange: 4,
      aiSummary: "<p>테스트</p>",
      completed: [
        { id: "c1", title: "고용변동 신고", description: "완료", status: "done", date: "03.05" },
      ],
      pending: [
        {
          id: "p1",
          title: "비자 연장",
          description: "미완료",
          status: "miss",
          badge: { text: "D-4", color: "red" },
        },
      ],
      legalChanges: [{ title: "최저임금법", description: "개정", color: "red" }],
      upcoming: [{ title: "비자 만료", description: "2026.04.15", urgency: "urgent" }],
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

import ReportsPage from "@/app/(app)/(legal)/reports/page";

describe("ReportsPage", () => {
  it("renders report header with score", () => {
    render(<ReportsPage />);
    expect(screen.getByText("73")).toBeInTheDocument();
    expect(screen.getByText("2026년 3월 리포트")).toBeInTheDocument();
  });

  it("renders completed section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("고용변동 신고")).toBeInTheDocument();
  });

  it("renders pending section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("비자 연장")).toBeInTheDocument();
  });

  it("renders legal changes section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("최저임금법")).toBeInTheDocument();
  });

  it("renders upcoming section", () => {
    render(<ReportsPage />);
    expect(screen.getByText("비자 만료")).toBeInTheDocument();
  });

  it("renders disclaimer", () => {
    render(<ReportsPage />);
    expect(screen.getByText(/법률 자문이 아닌 관리 보조 도구/)).toBeInTheDocument();
  });
});
