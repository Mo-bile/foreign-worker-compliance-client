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
  id: 1,
  title: "고용허가제 시행규칙 개정",
  lawName: "외국인근로자의 고용 등에 관한 법률 시행규칙",
  category: "LABOR",
  changeType: "ENFORCEMENT",
  effectiveDate: "2026-04-15",
  summary: "사업장 변경 사유 확대",
  severity: "HIGH",
  acknowledged: false,
  displayStatus: "UPCOMING",
  sourceType: "LAW",
  officialSourceUrl: "https://www.law.go.kr/example",
  icon: "⚖️",
  detectedDate: "2026-03-18",
  badge: { text: "조치 필요", color: "red" },
  dDay: -13,
};

const resolvedChange: LegalChange = {
  id: 3,
  title: "한-캄보디아 사회보장협정",
  lawName: "사회보장협정",
  category: "INSURANCE",
  changeType: "AMENDMENT",
  effectiveDate: "2026-03-01",
  summary: "캄보디아 국적 근로자 국민연금 이중가입 면제",
  severity: "LOW",
  acknowledged: true,
  displayStatus: "IN_FORCE",
  sourceType: "LAW",
  officialSourceUrl: "https://www.law.go.kr/example",
  icon: "🏥",
  detectedDate: "2026-02-15",
  dDay: null,
  badge: { text: "확인 완료", color: "green" },
};

describe("LegalCard", () => {
  it("renders card header with title and badge", () => {
    render(<LegalCard change={mockChange} companyId={1} />, { wrapper: Wrapper });
    expect(screen.getByText("고용허가제 시행규칙 개정")).toBeInTheDocument();
    expect(screen.getByText("조치 필요")).toBeInTheDocument();
    expect(screen.getByText("AI 안내")).toBeInTheDocument();
    expect(screen.getByText("시행 예정 (D-13)")).toBeInTheDocument();
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
