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
  });

  it("type_파라미터_없이_진입하면_페이지가_정상_렌더링된다", async () => {
    render(<CompliancePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("컴플라이언스 현황")).toBeDefined();
    });
  });

  it("type=VISA_EXPIRY로_진입하면_페이지가_정상_렌더링된다", async () => {
    mockSearchParams.set("type", "VISA_EXPIRY");
    render(<CompliancePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("컴플라이언스 현황")).toBeDefined();
    });
  });

  it("유효하지_않은_type_파라미터는_무시하고_페이지가_정상_렌더링된다", async () => {
    mockSearchParams.set("type", "INVALID_TYPE");
    render(<CompliancePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("컴플라이언스 현황")).toBeDefined();
    });
  });
});
