import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSelect } from "@/components/common/filter-select";

const options = ["A", "B", "C"] as const;
const labelMap: Record<string, string> = { A: "옵션 A", B: "옵션 B", C: "옵션 C" };

describe("FilterSelect", () => {
  it("placeholder를_aria-label로_설정한다", () => {
    render(
      <FilterSelect
        value="ALL"
        onValueChange={() => {}}
        placeholder="테스트 필터"
        options={[...options]}
        labelMap={labelMap}
      />,
    );
    expect(screen.getByRole("combobox", { name: "테스트 필터" })).toBeInTheDocument();
  });

  it("labelMap_없으면_value를_그대로_표시한다", async () => {
    const user = userEvent.setup();
    render(
      <FilterSelect
        value="ALL"
        onValueChange={() => {}}
        placeholder="필터"
        options={[...options]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("전체_옵션이_항상_첫번째에_있다", async () => {
    const user = userEvent.setup();
    render(
      <FilterSelect
        value="ALL"
        onValueChange={() => {}}
        placeholder="필터"
        options={[...options]}
        labelMap={labelMap}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("전체")).toBeInTheDocument();
  });

  it("옵션_선택시_onValueChange를_호출한다", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterSelect
        value="ALL"
        onValueChange={onValueChange}
        placeholder="필터"
        options={[...options]}
        labelMap={labelMap}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("옵션 B"));
    expect(onValueChange).toHaveBeenCalledWith("B");
  });
});
