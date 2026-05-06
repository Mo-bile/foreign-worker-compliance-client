import { test, expect } from "@playwright/test";

test.describe("Worker 페이지 페이지네이션 및 필터링", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workers");
    await page.waitForSelector("table");
  });

  test("페이지네이션이_표시된다", async ({ page }) => {
    await expect(page.getByText(/총 \d+건 중 1-/)).toBeVisible();
  });

  test("다음_페이지로_이동한다", async ({ page }) => {
    await page.getByRole("button", { name: "다음 페이지" }).click();
    await expect(page.getByText(/총 \d+건 중 21-/)).toBeVisible();
  });

  test("필터_변경시_1페이지로_리셋된다", async ({ page }) => {
    await page.getByRole("button", { name: "다음 페이지" }).click();
    await expect(page.getByText(/총 \d+건 중 21-/)).toBeVisible();
    await page.getByPlaceholder("검색어 입력...").fill("Worker");
    await expect(page.getByText(/총 \d+건 중 1-/)).toBeVisible();
  });
});

test.describe("Compliance 페이지 필터링", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compliance");
    await page.waitForSelector("table");
  });

  test("통합_보기_조건_바가_표시된다", async ({ page }) => {
    await expect(page.getByText("보기 조건:")).toBeVisible();
  });

  test("주요_기한_유형_보기_조건이_동작한다", async ({ page }) => {
    await page.getByRole("combobox", { name: "주요 기한 유형" }).click();
    await page.getByRole("option", { name: "비자 만료" }).click();
    await expect(page.getByText("보기 조건:")).toBeVisible();
  });
});
