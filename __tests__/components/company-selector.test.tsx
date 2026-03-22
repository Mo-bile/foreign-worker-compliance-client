import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanySelector } from "@/components/companies/company-selector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompanyProvider } from "@/lib/contexts/company-context";
import { server } from "@/mocks/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>{ui}</CompanyProvider>
    </QueryClientProvider>,
  );
}

describe("CompanySelector", () => {
  it("사업장_선택_드롭다운을_렌더링한다", async () => {
    renderWithProviders(<CompanySelector />);
    expect(await screen.findByRole("combobox", { name: "사업장 선택" })).toBeDefined();
  });
});
