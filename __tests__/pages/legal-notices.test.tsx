import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { mockLegalChangesResponse } from "@/mocks/legal-data";
import LegalChangesPage from "@/app/(app)/legal/changes/page";
import ReportsPage from "@/app/(app)/legal/reports/page";
import type { ComplianceReport } from "@/types/compliance-report";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({
    selectedCompanyId: 1,
  }),
}));

vi.mock("@/lib/queries/use-legal-changes", () => ({
  useLegalChanges: () => ({
    data: mockLegalChangesResponse,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/queries/use-legal-impact", () => ({
  useLegalImpact: () => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

const mockComplianceReport: ComplianceReport = {
  yearMonth: "2026-04",
  monthlyComplianceScore: 82,
  breakdown: {
    insurance: 90,
    deadline: 74,
  },
  monthToMonthChange: 3,
  snapshottedAt: "2026-04-25T09:00:00",
};

vi.mock("@/lib/queries/use-compliance-report", () => ({
  useComplianceReport: () => ({
    data: mockComplianceReport,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("LegalChangesPage notice", () => {
  it("shows plain-language source guidance", () => {
    render(<LegalChangesPage />);

    expect(screen.getByText(/공식 기관에서 확인한 법령 변경 정보입니다/)).toBeInTheDocument();
    expect(screen.getByText(/각 항목에서 원문을 확인할 수 있습니다/)).toBeInTheDocument();
    expect(screen.getByText(/참고용 안내입니다/)).toBeInTheDocument();
  });
});

describe("ReportsPage notice", () => {
  it("shows plain-language report guidance", () => {
    render(<ReportsPage />);

    expect(screen.getByText(/보험 가입과 주요 기한 준수 현황/)).toBeInTheDocument();
    expect(screen.getByText(/사업장 관리 상태를 빠르게 확인하기 위한 참고 지표/)).toBeInTheDocument();
    expect(screen.getByText(/다음 리포트에 반영될 수 있습니다/)).toBeInTheDocument();
  });
});
