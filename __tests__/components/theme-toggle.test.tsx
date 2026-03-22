import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/layout/theme-toggle";

// next-themes 모킹
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("테마_전환_버튼을_렌더링한다", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "테마 전환" })).toBeDefined();
  });

  it("클릭_시_setTheme을_호출한다", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "테마 전환" }));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
