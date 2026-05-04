import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyForm } from "@/components/companies/company-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/companies/new",
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CompanyForm", () => {
  it("등록_모드에서_필수_필드를_렌더링한다", () => {
    renderWithProviders(<CompanyForm mode="create" />);

    expect(screen.getByLabelText("회사명")).toBeDefined();
    expect(screen.getByLabelText("사업자번호")).toBeDefined();
    expect(screen.getByLabelText("지역")).toBeDefined();
    expect(screen.getByLabelText("업종")).toBeDefined();
    expect(screen.getByLabelText("상시근로자 수 (선택)")).toBeDefined();
    expect(screen.queryByLabelText("외국인 근로자 수")).toBeNull();
    expect(screen.getByLabelText("주소")).toBeDefined();
    expect(screen.getByLabelText("연락처")).toBeDefined();
  });

  it("필수_필드가_비어있으면_에러를_표시한다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyForm mode="create" />);

    await user.click(screen.getByRole("button", { name: "등록" }));
    expect(await screen.findByText("회사명을 입력해주세요")).toBeDefined();
  });

  it("수정_모드에서_사업자번호가_비활성화된다", () => {
    renderWithProviders(
      <CompanyForm
        mode="edit"
        defaultValues={{
          name: "테스트",
          region: "SEOUL",
          industryCategory: "MANUFACTURING",
          employeeCount: 10,
          address: "서울",
          contactPhone: "02-1234",
        }}
        businessNumber="123-45-67890"
        companyId={1}
      />,
    );

    const bizInput = screen.getByLabelText("사업자번호");
    expect(bizInput).toHaveProperty("disabled", true);
  });
});
