import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LegalCard } from "@/components/legal/legal-card";
import type { LegalChange } from "@/types/legal";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const mockChange: LegalChange = {
  id: "lc-1",
  title: "고용허가제 시행규칙 개정",
  icon: "📋",
  lawName: "외국인근로자의 고용 등에 관한 법률 시행규칙",
  effectiveDate: "2026-04-15",
  detectedDate: "2026-03-18",
  severity: "warning",
  status: "reference",
  badge: { text: "참고", color: "orange" },
  dDay: 22,
  displayStatus: "UPCOMING",
  sourceType: "LAW",
  officialSourceUrl: "https://www.law.go.kr/example",
};

const resolvedChange: LegalChange = {
  id: "lc-3",
  title: "한-캄보디아 사회보장협정",
  icon: "🌐",
  lawName: "사회보장협정",
  effectiveDate: "2026-03-01",
  detectedDate: "2026-02-15",
  severity: "resolved",
  status: "resolved",
  badge: { text: "확인 완료", color: "green" },
  displayStatus: "UPCOMING",
  sourceType: "LAW",
  officialSourceUrl: "https://www.law.go.kr/example",
};

describe("LegalCard", () => {
  it("renders card header with title and badge", () => {
    render(<LegalCard change={mockChange} companyId={1} />, { wrapper: Wrapper });
    expect(screen.getByText("고용허가제 시행규칙 개정")).toBeInTheDocument();
    expect(screen.getByText("참고")).toBeInTheDocument();
    expect(screen.getByText("시행 예정 (D+22)")).toBeInTheDocument();
    expect(screen.getByText("법률")).toBeInTheDocument();
  });

  it("expands on click to show body", async () => {
    render(<LegalCard change={mockChange} companyId={1} />, { wrapper: Wrapper });
    const header = screen.getByRole("button");
    expect(header).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("resolved card renders as non-expandable div without button", () => {
    const { container } = render(<LegalCard change={resolvedChange} companyId={1} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText("한-캄보디아 사회보장협정")).toBeInTheDocument();
    expect(container.querySelector("button[aria-expanded]")).toBeNull();
  });
});
