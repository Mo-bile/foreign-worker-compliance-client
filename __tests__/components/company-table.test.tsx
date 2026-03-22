import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyTable } from "@/components/companies/company-table";
import { mockCompanies } from "@/mocks/data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/companies",
}));

describe("CompanyTable", () => {
  it("사업장_목록을_테이블로_렌더링한다", () => {
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);
    expect(screen.getByText("한국전자 주식회사")).toBeDefined();
    expect(screen.getByText("부산건설 주식회사")).toBeDefined();
  });

  it("로딩_중이면_스켈레톤을_표시한다", () => {
    render(<CompanyTable companies={[]} isLoading={true} />);
    expect(screen.queryByText("한국전자 주식회사")).toBeNull();
  });

  it("빈_상태에서_CTA를_표시한다", () => {
    render(<CompanyTable companies={[]} isLoading={false} />);
    expect(screen.getByText(/첫 사업장을 등록/)).toBeDefined();
  });
});
