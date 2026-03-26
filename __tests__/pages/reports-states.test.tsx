import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({ selectedCompanyId: null }),
}));
vi.mock("@/lib/queries/use-compliance-report", () => ({
  useComplianceReport: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
}));

import ReportsPage from "@/app/(app)/(legal)/reports/page";

describe("ReportsPage — no company selected", () => {
  it("shows no-company message when selectedCompanyId is null", () => {
    render(<ReportsPage />);
    expect(screen.getByText("사업장을 선택해주세요")).toBeInTheDocument();
  });
});
