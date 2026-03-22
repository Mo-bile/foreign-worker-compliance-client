import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/layout/theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

const mockSetTheme = vi.fn();
const mockUseTheme = vi.mocked(useTheme);

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockUseTheme.mockReturnValue({
      resolvedTheme: "light",
      setTheme: mockSetTheme,
      theme: "light",
      themes: ["light", "dark"],
      systemTheme: undefined,
      forcedTheme: undefined,
    });
  });

  it("테마_전환_버튼을_렌더링한다", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "테마 전환" })).toBeInTheDocument();
  });

  it("라이트_모드에서_클릭_시_다크_모드로_전환한다", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "테마 전환" }));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("resolvedTheme이_undefined일_때_클릭하면_다크_모드로_전환한다", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: undefined,
      setTheme: mockSetTheme,
      theme: undefined,
      themes: ["light", "dark"],
      systemTheme: undefined,
      forcedTheme: undefined,
    });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "테마 전환" }));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("다크_모드에서_클릭_시_라이트_모드로_전환한다", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "dark",
      setTheme: mockSetTheme,
      theme: "dark",
      themes: ["light", "dark"],
      systemTheme: undefined,
      forcedTheme: undefined,
    });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "테마 전환" }));

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
