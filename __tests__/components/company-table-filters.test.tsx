import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyTable } from "@/components/companies/company-table";
import { mockCompanies } from "@/mocks/data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/companies",
}));

describe("CompanyTable 필터/검색", () => {
  it("회사명으로_검색하면_일치하는_행만_표시된다", async () => {
    const user = userEvent.setup();
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText(/회사명 또는 사업자번호/);
    await user.type(searchInput, "한국전자");

    expect(screen.getByText("한국전자 주식회사")).toBeDefined();
    expect(screen.queryByText("부산건설 주식회사")).toBeNull();
    expect(screen.queryByText("경기농업 영농조합")).toBeNull();
  });

  it("사업자번호로_검색하면_일치하는_행만_표시된다", async () => {
    const user = userEvent.setup();
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText(/회사명 또는 사업자번호/);
    await user.type(searchInput, "234-56");

    expect(screen.getByText("부산건설 주식회사")).toBeDefined();
    expect(screen.queryByText("한국전자 주식회사")).toBeNull();
  });

  it("검색결과가_없으면_빈_상태_메시지를_표시한다", async () => {
    const user = userEvent.setup();
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText(/회사명 또는 사업자번호/);
    await user.type(searchInput, "존재하지않는회사");

    expect(screen.getByText("조건에 맞는 사업장이 없습니다")).toBeDefined();
  });

  it("지역_필터를_적용하면_해당_지역만_표시된다", async () => {
    const user = userEvent.setup();
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);

    const regionTrigger = screen.getByRole("combobox", { name: "지역 필터" });
    await user.click(regionTrigger);
    const busanOption = await screen.findByRole("option", { name: "부산" });
    await user.click(busanOption);

    expect(screen.getByText("부산건설 주식회사")).toBeDefined();
    expect(screen.queryByText("한국전자 주식회사")).toBeNull();
    expect(screen.queryByText("경기농업 영농조합")).toBeNull();
  });

  it("업종_필터를_적용하면_해당_업종만_표시된다", async () => {
    const user = userEvent.setup();
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);

    const industryTrigger = screen.getByRole("combobox", { name: "업종 필터" });
    await user.click(industryTrigger);
    const agriOption = await screen.findByRole("option", { name: "농업" });
    await user.click(agriOption);

    expect(screen.getByText("경기농업 영농조합")).toBeDefined();
    expect(screen.queryByText("한국전자 주식회사")).toBeNull();
    expect(screen.queryByText("부산건설 주식회사")).toBeNull();
  });
});
