import { test, expect } from "@playwright/test";

test.describe("Company derivedCounts 회귀 방지 (PR-β)", () => {
  test("사업장_신규_등록_폼에_외국인_근로자_수_입력이_없다", async ({ page }) => {
    await page.goto("/companies/new");
    await expect(page.getByLabel("외국인 근로자 수")).toHaveCount(0);
    await expect(page.getByLabel("상시근로자 수 (선택)")).toBeVisible();
  });

  test("settings_company_화면에_25_vs_9_모순_입력_경로가_없다", async ({ page }) => {
    await page.goto("/settings/company");
    await expect(page.getByText("재직중 (전체)")).toBeVisible();
    await expect(page.getByText("9명")).toBeVisible();
    await expect(page.getByText("등록 기준 인원")).toBeVisible();

    await page.getByRole("button", { name: /수정/ }).first().click();
    await expect(page.getByLabel("외국인 근로자 수")).toHaveCount(0);
  });
});
