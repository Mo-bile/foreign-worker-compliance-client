import { test, expect } from "@playwright/test";

test.describe("WorkerStatus 4분리 회귀 방지 (PR-α D23)", () => {
  test("워커_목록에_4_상태_배지가_모두_노출된다", async ({ page }) => {
    await page.goto("/workers");
    await expect(page.getByText("확인 필요").first()).toBeVisible();
    await expect(page.getByText("입사 예정").first()).toBeVisible();

    await page.getByRole("combobox", { name: "상태 전체", exact: true }).click();
    await page.getByRole("option", { name: "재직중" }).click();
    await expect(page.getByText("재직중").first()).toBeVisible();

    await page.getByRole("combobox", { name: "상태 전체", exact: true }).click();
    await page.getByRole("option", { name: "고용종료" }).click();
    await expect(page.getByText("고용종료").first()).toBeVisible();
  });

  test("재직중_필터에_UPCOMING_워커가_섞이지_않는다_D23_라벨_오류_회귀", async ({ page }) => {
    await page.goto("/workers");
    await page.getByRole("combobox", { name: "상태 전체", exact: true }).click();
    await page.getByRole("option", { name: "재직중" }).click();

    await expect(page.locator("tbody").getByText("입사 예정")).toHaveCount(0);
  });
});
