import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockUseCompanyContext = vi.fn(() => ({
  selectedCompanyId: null as number | null,
  selectedCompany: null,
  companies: [],
}));

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => mockUseCompanyContext(),
}));

vi.mock("@/lib/queries/use-legal-changes", () => ({
  useLegalChanges: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

async function importPage() {
  const mod = await import("@/app/(app)/(legal)/legal-changes/page");
  return mod.default;
}

describe("LegalChangesPage states", () => {
  it("사업장_미선택_시_안내_메시지를_표시한다", async () => {
    const LegalChangesPage = await importPage();
    render(<LegalChangesPage />, { wrapper: createWrapper() });

    expect(screen.getByText("사업장을 선택해주세요")).toBeDefined();
  });
});
