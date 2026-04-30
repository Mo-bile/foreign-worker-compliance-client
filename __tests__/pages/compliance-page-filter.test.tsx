import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import CompliancePage from "@/app/(app)/compliance/page";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// useSearchParams mock
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockUseCompanyContext = vi.fn(() => ({
  selectedCompanyId: 1 as number | null,
  companies: [],
}));

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => mockUseCompanyContext(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("CompliancePage 쿼리파라미터 필터", () => {
  afterEach(() => {
    mockSearchParams.delete("type");
    mockUseCompanyContext.mockReturnValue({ selectedCompanyId: 1, companies: [] });
  });

  it("상단에 주요 기한 관리 안내 문구가 표시된다", () => {
    render(<CompliancePage />, { wrapper: createWrapper() });

    expect(screen.getByRole("heading", { name: "주요 기한 관리" })).toBeInTheDocument();
    expect(screen.getByText(/놓쳤거나 곧 다가오는 신고·갱신·보험 관련 기한/)).toBeInTheDocument();
    expect(screen.getByText(/기한이 지난 항목은 먼저 처리/)).toBeInTheDocument();
    expect(screen.getByText(/처리한 항목은 완료로 표시/)).toBeInTheDocument();
  });

  it("type_파라미터_없이_진입하면_전체_필터가_기본값이다", async () => {
    render(<CompliancePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      // shadcn Select는 hidden input에 선택된 값을 저장한다
      const triggers = screen.getAllByRole("combobox");
      const hiddenInput = triggers[0].nextElementSibling as HTMLInputElement;
      expect(hiddenInput.value).toBe("ALL");
    });
  });

  it("type=VISA_EXPIRY로_진입하면_비자_만료_필터가_선택된다", async () => {
    mockSearchParams.set("type", "VISA_EXPIRY");
    render(<CompliancePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      const triggers = screen.getAllByRole("combobox");
      const hiddenInput = triggers[0].nextElementSibling as HTMLInputElement;
      expect(hiddenInput.value).toBe("VISA_EXPIRY");
    });
  });

  it("유효하지_않은_type_파라미터는_무시하고_ALL이_기본값이다", async () => {
    mockSearchParams.set("type", "INVALID_TYPE");
    render(<CompliancePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      const triggers = screen.getAllByRole("combobox");
      const hiddenInput = triggers[0].nextElementSibling as HTMLInputElement;
      expect(hiddenInput.value).toBe("ALL");
    });
  });
});
