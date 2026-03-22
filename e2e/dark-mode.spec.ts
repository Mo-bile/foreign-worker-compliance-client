import { test, expect } from "@playwright/test";

test.describe("다크 모드 전환", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("기본_테마는_라이트_모드이다", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
  });

  test("토글_클릭_시_다크_모드로_전환된다", async ({ page }) => {
    await page.getByRole("button", { name: "테마 전환" }).click();
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });

  test("다크_모드에서_토글_클릭_시_라이트_모드로_돌아온다", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "테마 전환" });
    await toggle.click(); // → dark
    await toggle.click(); // → light
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
  });

  test("페이지_새로고침_후_테마가_유지된다", async ({ page }) => {
    await page.getByRole("button", { name: "테마 전환" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
