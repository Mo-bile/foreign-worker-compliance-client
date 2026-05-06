import { test, expect } from "@playwright/test";

test.describe("근로자 등록 플로우", () => {
  test("근로자를_등록하고_상세_페이지를_확인한다", async ({ page }) => {
    await page.goto("/workers/new");

    await page.getByRole("textbox", { name: "이름", exact: true }).fill("Nguyen Van Test");
    await page.getByLabel("생년월일").fill("1990-01-01");
    await page.getByLabel("국적").click();
    await page.getByRole("option", { name: "베트남" }).click();
    await page.getByLabel("비자 유형").click();
    await page.getByRole("option", { name: "비전문취업" }).click();
    await page.getByLabel("비자 만료일").fill("2027-12-31");
    await page.getByLabel("입국일").fill("2025-01-15");
    await page.getByLabel("계약 시작일").fill("2025-02-01");
    await page.getByRole("combobox", { name: "사업장", exact: true }).click();
    await page.getByRole("option", { name: /한국전자/ }).click();

    await page.getByRole("button", { name: "등록" }).click();

    await expect(page).toHaveURL(/\/workers\/\d+/);
    await expect(page.getByText("Nguyen Van Test")).toBeVisible();
  });

  test("필수_필드_누락시_에러를_표시한다", async ({ page }) => {
    await page.goto("/workers/new");
    await page.getByRole("button", { name: "등록" }).click();

    await expect(page.getByText("이름을 입력해주세요")).toBeVisible();
  });
});
