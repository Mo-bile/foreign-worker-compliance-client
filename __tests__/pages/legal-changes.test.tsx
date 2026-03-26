import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { LegalChangesResponse } from "@/types/legal";

const mockLegalChangesData: LegalChangesResponse = {
  changes: [
    {
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
    },
    {
      id: "lc-2",
      title: "최저임금법 시행령 개정",
      icon: "⚖️",
      lawName: "최저임금법 시행령",
      effectiveDate: "2026-07-01",
      detectedDate: "2026-03-20",
      severity: "critical",
      status: "action_required",
      badge: { text: "조치 필요", color: "red" },
      dDay: 99,
    },
    {
      id: "lc-3",
      title: "한-캄보디아 사회보장협정",
      icon: "🌐",
      lawName: "사회보장협정",
      effectiveDate: "2026-03-01",
      detectedDate: "2026-02-15",
      severity: "resolved",
      status: "resolved",
      badge: { text: "확인 완료", color: "green" },
    },
  ],
  lastSyncedAt: "2026-03-24T06:00:00+09:00",
};

const mockUseCompanyContext = vi.fn(() => ({
  selectedCompanyId: 1 as number | null,
  selectedCompany: null,
  companies: [],
}));

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => mockUseCompanyContext(),
}));

const mockUseLegalChanges = vi.fn(() => ({
  data: mockLegalChangesData,
  isLoading: false,
  isError: false,
  error: null,
}));

vi.mock("@/lib/queries/use-legal-changes", () => ({
  useLegalChanges: (...args: unknown[]) => mockUseLegalChanges(...args),
}));

vi.mock("@/lib/queries/use-legal-impact", () => ({
  useLegalImpact: () => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// Dynamic import to ensure mocks are set up before module loads
async function importPage() {
  const mod = await import("@/app/(app)/(legal)/legal-changes/page");
  return mod.default;
}

describe("LegalChangesPage", () => {
  it("3개의_법령_변경을_모두_렌더링한다", async () => {
    const LegalChangesPage = await importPage();
    render(<LegalChangesPage />, { wrapper: createWrapper() });

    expect(screen.getByText("고용허가제 시행규칙 개정")).toBeDefined();
    expect(screen.getByText("최저임금법 시행령 개정")).toBeDefined();
    expect(screen.getByText("한-캄보디아 사회보장협정")).toBeDefined();
  });

  it("조치필요_필터_적용_시_최저임금법만_표시된다", async () => {
    const user = userEvent.setup();
    const LegalChangesPage = await importPage();
    render(<LegalChangesPage />, { wrapper: createWrapper() });

    const actionRequiredButton = screen.getByRole("button", { name: "조치필요" });
    await user.click(actionRequiredButton);

    expect(screen.getByText("최저임금법 시행령 개정")).toBeDefined();
    expect(screen.queryByText("고용허가제 시행규칙 개정")).toBeNull();
    expect(screen.queryByText("한-캄보디아 사회보장협정")).toBeNull();
  });

  it("확인완료_필터_적용_시_한-캄보디아만_표시된다", async () => {
    const user = userEvent.setup();
    const LegalChangesPage = await importPage();
    render(<LegalChangesPage />, { wrapper: createWrapper() });

    const resolvedButton = screen.getByRole("button", { name: "확인완료" });
    await user.click(resolvedButton);

    expect(screen.getByText("한-캄보디아 사회보장협정")).toBeDefined();
    expect(screen.queryByText("고용허가제 시행규칙 개정")).toBeNull();
    expect(screen.queryByText("최저임금법 시행령 개정")).toBeNull();
  });
});
